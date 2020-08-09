const db = require('../util/database');

module.exports = class Cart {
    constructor(userId) {
        this.userId = userId;
    }

    save() {
        return db.execute(
            `INSERT INTO carts SET userId = ?`, [this.userId]
        )
        .then(result => {
            this.id = result[0].insertId;
            return this;
        })
        .catch(err => console.log(err));
    }

    static get(userId) {
        return db.execute(
            `SELECT * FROM carts WHERE userId = ?`, [userId]
        )
        .then(([[cart], metaData]) => {
            if(cart) {
                return Object.assign(new Cart(), cart);
            } else {
                return null;
            }
        })
        .catch(err => console.log(err));
    }

    static getProducts(id) {
        return db.execute(
            `SELECT products.*, cartitems.quantity, cartitems.id AS cartitemId FROM products
            JOIN cartitems ON cartitems.productId = products.id
            JOIN carts ON carts.id = cartitems.cartId
            WHERE carts.userId = ?`, [id]
        )
        .then(([products, metaData]) => {
            return products;
        })
        .catch(err => console.log(err));
    }

    delete() {
        return db.execute(
            `DELETE FROM carts WHERE id = ?`, [this.id]
        );
    }
}