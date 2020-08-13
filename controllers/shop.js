const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');
const stripe = require('stripe')(process.env.STRIPE_KEY);

const Product = require('../models/product');
const Cart = require('../models/cart');
const CartItem = require('../models/cart-item');
const Order = require('../models/order');
const OrderItem = require('../models/order-item');

exports.getIndex = (req, res, next) => {
    console.log('GET /');

    Product.fetchAll()
        .then(products => {
            res.render('shop/index', {
                pageTitle: 'Welcome',
                path: '/',
                products: products
            });
        })
        .catch(err => next(err));
}

exports.getProducts = (req, res, next) => {
    console.log('GET /products');

    const currentPage = +req.query.page;
    const itemsPerPage = process.env.ITEMS_PER_PAGE;
    let totalNumberOfProducts;

    Product.count()
        .then(count => {
            totalNumberOfProducts = count;
            return Product.fetchAllLimited(currentPage);
        })
        .then(products => {
            res.render('shop/product-list', {
                pageTitle: 'All products',
                path: '/products',
                products: products,
                currentPage: currentPage,
                hasNextPage: itemsPerPage * (currentPage + 1) < totalNumberOfProducts,
                hasPreviousPage: currentPage > 0,
                hasNextNextPage: itemsPerPage * (currentPage + 2) < totalNumberOfProducts,
                hasPreviousPreviousPage: currentPage > 1,
                nextPage: currentPage + 1,
                previousPage: currentPage ? currentPage - 1 : null,
                nextNextPage: currentPage + 2,
                previousPreviousPage: currentPage - 1 ? currentPage - 2 : null,
                lastPage: Math.ceil(totalNumberOfProducts / itemsPerPage) - 1
            });
        })
        .catch(err => next(err));
}

exports.getProduct = (req, res, next) => {
    console.log('GET /product/' + req.params.productId);

    Product.findById(req.params.productId)
        .then(product => {
            res.render('shop/product-detail', {
                pageTitle: product.title,
                path: '/products',
                product: product
            });
        })
        .catch(err => next(err));
}

exports.getCart = (req, res, next) => {
    console.log('GET /cart');

    Cart.getProducts(req.session.user.id)
        .then(cartProducts => {
            res.render('shop/cart', {
                pageTitle: 'Your Cart',
                path: '/cart',
                products: cartProducts
            });
        })
        .catch(err => next(err));
}

exports.postCartItem = (req, res, next) => {
    console.log('POST /cart-add-item/' + req.body.productId);

    let cart;
    
    Cart.get(req.session.user.id)
        .then(result => {
            cart = result;
            return CartItem.find(req.body.productId, cart.id)
        })
        .then(cartItem => {
            if(cartItem) {
                return cartItem.addOne();                 
            } else {
                cartItem = new CartItem(1, req.body.productId, cart.id);
                return cartItem.addToCart();
            }
        })
        .then(() => {
            res.redirect('/products/?page=0');
        })
        .catch(err => next(err));
}

exports.postCartDeleteItem = (req, res, next) => {
    console.log('POST /cart-delete-item/' + req.body.productId);
    
    CartItem.delete(req.body.cartitemId)
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => next(err));
}

exports.getCheckout = (req, res, next) => {
    console.log('GET /checkout');

    Cart.getProducts(req.session.user.id)
        .then(products => {
            let totalSum = 0;
            products.forEach(product => {
                totalSum += product.quantity * product.price;
            });
            res.render('shop/checkout', {
                pageTitle: 'Checkout',
                path: '/checkout',
                products: products,
                totalSum: totalSum.toFixed(2)
            });
        })
        .catch(err => next(err));
}

exports.postOrder = (req, res, next) => {
    console.log('POST /create-order');

    const stripeToken = req.body.stripeToken;
    let totalSum = 0;
    
    const getCartPromise = Cart.get(req.session.user.id)
    .then(result => {
        return result;
    })
    .catch(err => next(err));
    
    const createOrderPromise = new Order(req.session.user.id).save()
        .then(result => {
            return result;
        })
        .catch(err => next(err));

    const fillOrderPromise = Promise.all([getCartPromise, createOrderPromise])
        .then(([cart, order]) => {
            CartItem.fetchAll(cart.id)
                .then(cartItems => {
                    cartItems.forEach(cartItem => {
                        let orderItem = new OrderItem(cartItem.quantity, cartItem.productId, order.id);
                        orderItem.save();
                    });
                })
                .then(() => {
                    cart.delete();
                })
                .catch(err => next(err));
        })
        .catch(err => next(err));

    const calculateTotalSumPromise = Cart.getProducts(req.session.user.id)
        .then(products => {
            products.forEach(product => {
                totalSum += product.quantity * product.price;
            });
            return Math.round(totalSum * 100);
        })
        .catch(err => next(err));

    Promise.all([fillOrderPromise, calculateTotalSumPromise])
        .then(([nothing, totalSum]) => {
            return stripe.charges.create({
                amount: totalSum,
                currency: 'eur',
                description: '',
                source: stripeToken
            })
        })
        .then(() => {
            res.redirect('/products/?page=0');
        })
        .catch(err => next(err));
}

exports.getOrders = (req, res, next) => {
    console.log('GET /orders');

    Order.getOrdersId(req.session.user.id)
        .then(result => {
            let promises = [];
            result.forEach(id => {
                promises.push(OrderItem.getOrderItemsProducts(id));
            });
            return Promise.all(promises)
        })
        .then(orders => {
            res.render('shop/orders', {
                pageTitle: 'Your Orders',
                path: '/orders',
                orders: orders
            });
        })
        .catch(err => next(err));
}

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    const invoiceName = 'invoice-' + orderId + '.pdf';
    const invoicePath = path.join('data', 'invoices', invoiceName);

    Order.getUserId(orderId)
        .then((userId) => {
            if (userId === req.session.user.id) {
                res.set({
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': 'inline; filename="' + invoiceName + '"'
                });

                const pdfDoc = new PDFDocument();
                pdfDoc.pipe(fs.createWriteStream(invoicePath));
                pdfDoc.pipe(res);

                pdfDoc.fontSize(26).text('Invoice - #' + orderId);
                pdfDoc.fontSize(20).text('---------------------------');
                let totalPrice = 0;
                OrderItem.getOrderItemsProducts(orderId)
                    .then(items => {
                        items.forEach(item => {
                            totalPrice += item.quantity * item.price;
                            pdfDoc.fontSize(16).text(item.title + ' - ' + item.quantity + ' x €' + item.price);
                        });
                        pdfDoc.fontSize(20).text('---------------------------');
                        pdfDoc.text('Total price: €' + totalPrice);
                        pdfDoc.end();
                    })
                    .catch(err => next(err));
            } else if(!userId){
                next(new Error('No order found'));
            } else {
                next(new Error('Unauthorized'));
            }
        })
        .catch(err => next(err));
    
}
