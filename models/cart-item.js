const db = require('../util/database');

module.exports = class CartItem {
    constructor(quantity, productId, cartId) {
        this.quantity = quantity;
        this.productId = productId;
        this.cartId = cartId;
    }

    static fetchAll(cartId) {
        return db.execute('SELECT * FROM cartitems WHERE cartId = ?', [cartId]);
    }

    static find(productId, cartId) {
        return db.execute(
            `SELECT * FROM cartitems
            WHERE productId = ?
            AND cartId = ?`, [productId, cartId]
        )
        .then(([[item], metaData]) => {
            if(item) {
                let cartItem = new CartItem(item.quantity, item.productId, item.cartId);
                cartItem.id = item.id;
                return cartItem;
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
        );
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