const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: process.env.SENDGRID_KEY
    }
}));

exports.getLogin = (req, res, next) => {
    console.log('GET /login');
    
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: null,
        oldInput: { email: '', password: '' },
        validationErrors: []
    });
}

exports.postLogin = (req, res, next) => {
    console.log('POST /login');

    const errors = validationResult(req);

    if(errors.isEmpty()) {
        User.findByEmail(req.body.email)
            .then((user) => {
                if(user) {
                    bcrypt.compare(req.body.password, user.password)
                        .then((match) => {
                            if(match) {
                                req.session.isLoggedIn = true;
                                req.session.user = user;
                                req.session.save(err => {
                                    if(err) {
                                        console.log(err);
                                    } else {
                                        console.log('Login succesful -> ' + user.email)
                                        res.redirect('/');
                                    }
                                });
                            } else {
                                console.log('Login failed -> Invalid password');
                                return res.status(422).render('auth/login', {
                                    pageTitle: 'Login',
                                    path: '/login',
                                    errorMessage: 'Invalid email or password',
                                    oldInput: { 
                                        email: req.body.email, 
                                        password: req.body.password 
                                    },
                                    validationErrors: []
                                });
                            }
                        })
                        .catch(err => next(err));
                } else {
                    console.log('Login failed -> User doen\'t exists');
                    return res.status(422).render('auth/login', {
                        pageTitle: 'Login',
                        path: '/login',
                        errorMessage: 'Invalid email or password',
                        oldInput: { 
                            email: req.body.email, 
                            password: req.body.password 
                        },
                        validationErrors: []
                    });
                }
            })       
            .catch(err => next(err));
    } else {
        return res.status(422).render('auth/login', {
            pageTitle: 'Login',
            path: '/login',
            errorMessage: errors.errors[0].msg,
            oldInput: { 
                email: req.body.email, 
                password: req.body.password 
            },
            validationErrors: errors.array()
        });
    }
}

exports.getSignup = (req, res, next) => {
    console.log('GET /signup');
    
    res.render('auth/signup', {
        pageTitle: 'Signup',
        path: '/signup',
        errorMessage: null,
        oldInput: { email: '', password: '', confirmPassword: '' },
        validationErrors: []
    });
}

exports.postSignup = (req, res, next) => {
    console.log('POST /signup');

    const errors = validationResult(req);

    if(errors.isEmpty()) {
        bcrypt.hash(req.body.password, 12)
            .then((hashedPassword) => {
                const user = new User(req.body.email, hashedPassword);
                return user.save();
            })
            .then(() => {
                console.log('New user created!');
                res.redirect('/login');

                return transporter.sendMail({
                    to: req.body.email,
                    from: 'simun.terzanovic@gmail.com',
                    subject: 'Signup successfull',
                    html: '<h2>Congratulations! You have successfully signed up.</h2>'
                })
                .catch(err => next(err));
            })
            .catch(err => next(err));
    } else {
        return res.status(422).render('auth/signup', {
            pageTitle: 'Signup',
            path: '/signup',
            errorMessage: errors.errors[0].msg,
            oldInput: { email: req.body.email, password: req.body.password, confirmPassword: req.body.confirmPassword },
            validationErrors: errors.array()
        });
    }
}

exports.postLogout = (req, res, next) => {
    console.log('POST /logout');
    
    req.session.destroy((err) => {
        if(err) {
            console.log(err);
        }
        res.redirect('/');
    });
}

exports.getReset = (req, res, next) => {
    console.log('GET /reset');

    let message = req.flash('error');
    if(message.length > 0) {
        message = message;
    } else {
        message = null;
    }

    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: message
    });
}

exports.postReset = (req, res, next) => {

    crypto.randomBytes(32, (err, buffer) => {

        if(err) {
            console.log(err);
            return res.redirect('/reset');
        }

        const token = buffer.toString('hex');

        User.findByEmail(req.body.email)
            .then(user => {
                if(user) {
                    return user.setToken(token);
                } else {
                    req.flash('error', 'Account not found');
                    res.redirect('/reset');
                    return Promise.reject('redirected...');
                }
            })
            .then((result) => {
                res.redirect('/');
                return transporter.sendMail({
                    to: req.body.email,
                    from: 'simun.terzanovic@gmail.com',
                    subject: 'Password reset',
                    html: `
                        <p>Password reset requested.</p>
                        <p>Please click this <a href="http://localhost:3000/reset/${token}">link</a> to reset your password.</p>
                    `
                })
                .catch(err => next(err));
            })
            .catch(err => next(err));
    })
}

exports.getNewPassword = (req, res, next) => {
    console.log('GET /new-password');

    User.findByToken(req.params.token)
        .then((user) => {
            if(user) {
                let message = req.flash('error');
                if(message.length > 0) {
                    message = message;
                } else {
                    message = null;
                }
            
                res.render('auth/new-password', {
                    path: '/new-password',
                    pageTitle: 'Change Password',
                    errorMessage: message,
                    userId: user.id,
                    token: req.params.token
                });
            } else {
                req.flash('error', 'Invalid token');
                res.redirect('/');
            }
        })
        .catch(err => next(err));
}

exports.postNewPassword = (req, res, next) => {
    console.log('POST /new-password');

    bcrypt.hash(req.body.password, 12)
        .then((hashedPassword) => {
            res.redirect('/login');
            return User.setNewPassword(req.body.userId, hashedPassword, req.body.token);
        })
        .catch(err => next(err));
}