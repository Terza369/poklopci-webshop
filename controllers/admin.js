const { validationResult } = require('express-validator')

const Product = require('../models/product');
const fileHelper = require('../util/file');

exports.getProducts = (req, res, next) => {
    console.log('GET /admin/products');

    Product.fetchAll(req.session.user.id)
        .then(([products, metaData]) => {
            res.render('admin/products', {
                pageTitle: 'Products',
                path: '/admin/products',
                products: products
            });
        })
        .catch(err => next(err));
}

exports.getAddProduct = (req, res, next) => {
    console.log('GET /admin/edit-product');

    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        product: {},
        hasError: false,
        errorMessage: null,
        validationErrors: []
    });
}

exports.postAddProduct = (req, res, next) => {
    console.log('POST /admin/edit-product NEW ' + req.body.title);

    const errors = validationResult(req);

    if(!req.file) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            product: {
                title: req.body.title,
                price: req.body.price,
                description: req.body.description,
                id: req.body.id,
                userId: req.body.userId
            },
            hasError: true,
            errorMessage: 'Attached file is not an image',
            validationErrors: []
        });
    }

    if(errors.isEmpty()) {
        const product = new Product(req.body.title, req.file.path, req.body.price, req.body.description, req.session.user.id);
        product.save()
            .then(() => {
                res.redirect('/admin/products');
            })
            .catch(err => next(err));
    } else {
        res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            product: {
                title: req.body.title,
                price: req.body.price,
                imageUrl: req.file.path,
                description: req.body.description,
                id: req.body.id,
                userId: req.body.userId
            },
            hasError: true,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }

}

exports.getEditProduct = (req, res, next) => {
    console.log('GET /admin/edit-product');

    const editMode = req.query.edit;

    if(editMode) {
        Product.findById(req.params.productId)
            .then(([[product], metaData]) => {
                res.render('admin/edit-product', {
                    pageTitle: 'Edit: ' + product.title,
                    path: '/admin/edit-product',
                    product: product,
                    editing: editMode,
                    hasError: false,
                    errorMessage: null,
                    validationErrors: []
                });
            })
            .catch(err => next(err));
    } else {
        res.redirect('/admin/products');
    }

}

exports.postEditProduct = (req, res, next) => {
    console.log('POST /admin/edit-product/' + req.body.id);

    const errors = validationResult(req);

    if(req.body.userId == req.session.user.id) {
        if(errors.isEmpty()) {
            let imageUrl;
            Product.findById(req.body.id)
                .then(([[product], metaData]) => {
                    if(req.file) {
                        imageUrl = req.file.path;
                        fileHelper.deleteFile(product.imageUrl);
                    } else {
                        imageUrl = null;
                    }
                    const newProduct = new Product(req.body.title, imageUrl, req.body.price, req.body.description, req.session.user.id);
                    newProduct.id = req.body.id;
                    return newProduct.update()
                })
                .then(() => {
                    console.log('Product ' + req.body.id + ' updated');
                    res.redirect('/admin/products');
                })
                .catch(err => next(err));
        } else {
            res.status(422).render('admin/edit-product', {
                pageTitle: 'Edit: ' + req.body.title,
                path: '/admin/edit-product',
                editing: true,
                product: {
                    title: req.body.title,
                    price: req.body.price,
                    description: req.body.description,
                    id: req.body.id,
                    userId: req.body.userId
                },
                hasError: true,
                errorMessage: errors.array()[0].msg,
                validationErrors: errors.array()
            });
        }
    } else {
        console.log('Invalid user. Edit denied.');
        res.redirect('/');
    }

}

exports.postDeleteProduct = (req, res, next) => {
    console.log('POST /admin/delete-product/' + req.body.productId);

    if(req.body.userId == req.session.user.id) {  
        Product.findById(req.body.productId)
                .then(([[product], metaData]) => {
                    if(product) {
                        fileHelper.deleteFile(product.imageUrl);
                        return Product.deleteById(req.body.productId);
                    } else {
                        return next(new Error('Product not found'));
                    }
                })
                .then(() => {
                    console.log('Product ' + req.body.productId + ' deleted');
                    res.redirect('/admin/products');
                })
                .catch(err => next(err));
    } else {
        console.log('Invalid user. Edit denied.');
        res.redirect('/');
    }
}
