const express = require('express');
const { body } = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/add-product', isAuth, adminController.getAddProduct);
router.post('/add-product', isAuth,
    [
        body('title')
            .trim()
            .isLength({ min: 3 })
            .withMessage('Field must contain more then 3 characters'),
        body('price')
            .isFloat()
            .withMessage('Please enter a valid price'),
        body('description')
            .trim()
            .isLength({ min: 5, max: 200 })
            .withMessage('Description must be between 5 and 200 characters long')
    ],
    adminController.postAddProduct
);

router.get('/products', isAuth, adminController.getProducts);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);
router.post('/edit-product', isAuth, 
    [
        body('title')
            .trim()
            .isLength({ min: 3 })
            .withMessage('Field must contain more then 3 characters'),
        body('price')
            .isFloat()
            .withMessage('Please enter a valid price'),
        body('description')
            .trim()
            .isLength({ min: 5, max: 200 })
            .withMessage('Description must be between 5 and 200 characters long')
    ],
    adminController.postEditProduct
);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
