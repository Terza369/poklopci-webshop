const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);
router.post('/login',
    [
        body('email')
            .normalizeEmail()
            .not()
            .isEmpty()
            .withMessage('Please enter a valid email address'),
        body('password')
            .trim()
            .not()
            .isEmpty()
            .withMessage('Please enter a password')
    ],
    authController.postLogin
);

router.get('/signup', authController.getSignup);
router.post('/signup',
    [
        body('email')
            .normalizeEmail()
            .isEmail()
            .withMessage('Please enter a valid email address')
            .custom((value, {req}) => {
                return User.existsByEmail(value)
                    .then((result) => {
                        if(result) {
                            return Promise.reject('User already exists');
                        } 
                })
            }),
        body('password', 'Password must be at least 5 characters long and contain only letters and numbers')
            .trim()
            .isLength({min: 5})
            .isAlphanumeric(),
        body('confirmPassword')
            .trim()
            .isLength({min: 5})
            .isAlphanumeric()
            .custom((value, {req}) => {
                if(value !== req.body.password) {
                    throw new Error('Passwords do not match');
                } else {
                    return true;
                }
            })
    ],
    authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);
router.post('/reset',[
    body('email')
        .normalizeEmail()
        .not()
        .isEmpty()
        .withMessage('Please enter a valid email address')
], authController.postReset);

router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;