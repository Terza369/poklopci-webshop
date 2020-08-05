const db = require('../util/database');

module.exports = class Cart {
    constructor(userId) {
        this.userId = userId;
    }

    save() {
        return db.execute(
            `INSERT INTO carts(userId) values(?)`, [this.userId]
        )
        .then(result => {
            this.id = result[0].insertId;
        })
        .catch(err => console.log(err));
    }

    static get(userId) {
        return db.execute(
            `SELECT * FROM carts WHERE userId = ?`, [userId]
        )
        .then(([[item], metaData]) => {
            if(item) {
                return Object.assign(new Cart(), item);
            } else {
                return null;
            }
        })
        .catch(err => console.log(err))
    }

    static getProducts(id) {
        return db.execute(
            `SELECT products.*, cartitems.quantity, cartitems.id AS cartitemId FROM products
            JOIN cartitems ON cartitems.productId = products.id
            JOIN carts ON carts.id = cartitems.cartId
            WHERE carts.userId = ?`, [id]
        );
    }

    delete() {
        return db.execute(
            `DELETE FROM carts WHERE id = ?`, [this.id]
        );
    }
}