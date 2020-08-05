const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart-add-item', isAuth, shopController.postCartItem);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteItem);

router.get('/orders', isAuth, shopController.getOrders);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);

router.get('/checkout', isAuth, shopController.getCheckout);

module.exports = router;