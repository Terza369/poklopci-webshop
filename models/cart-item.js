const db = require('../util/database');

module.exports = class CartItem {
    constructor(quantity, productId, cartId) {
        this.quantity = quantity;
        this.productId = productId;
        this.cartId = cartId;
    }

    static fetchAll(cartId) {
        return db.execute('SELECT * FROM cartitems WHERE cartId = ?', [cartId])
            .then(([cartItems, metaData]) => {
                for(let i = 0; i < cartItems.length; i++) {
                    cartItems[i] = Object.assign(new CartItem(), cartItems[i]);
                }
                return cartItems;
            })
            .catch(err => console.log(err));
    }

    static find(productId, cartId) {
        return db.execute(
            `SELECT * FROM cartitems
            WHERE productId = ?
            AND cartId = ?`, [productId, cartId]
        )
        .then(([[item], metaData]) => {
            if(item) {
                return Object.assign(new CartItem(), item);;
            } else {
                return null;
            }
        })
        .catch(err => console.log(err));
    }

    addToCart() {
        return db.execute(
            `INSERT INTO cartitems SET
            quantity = ?,
            productId = ?,
            cartId = ?`, [this.quantity, this.productId, this.cartId]
        )
        .then(result => {
            this.id = result[0].insertId;
            return this;
        })
        .catch(err => console.log(err));
    }

    addOne() {
        return db.execute(
            `UPDATE cartitems SET
            quantity = quantity + 1
            WHERE id = ?`, [this.id]
        );
    }

    static delete(id) {
        return db.execute(
            `DELETE FROM cartitems
            WHERE cartitems.id = ?`, [id]
        );
    }
}