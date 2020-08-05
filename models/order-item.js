const db = require('../util/database');

module.exports = class OrderItem {
    constructor(quantity, productId, orderId) {
        this.quantity = quantity;
        this.productId = productId;
        this.orderId = orderId;
    }

    //saves the object to the database
    //and attaches the designated ID property to it
    save() {
        return db.execute(
            `INSERT INTO orderitems SET
            quantity = ?,
            productId = ?,
            orderId = ?`, [this.quantity, this.productId, this.orderId]
        )
        .then(result => {
            this.id = result[0].insertId;
        })
        .catch(err => console.log(err));
    }

    //gets the list of items for a given order
    static getItems(orderId) {
        return db.execute(
            `SELECT * FROM orderitems WHERE orderId = ?`, [orderId]
        )
        .then(([result, metaData]) => {
            return result;
        })
        .catch(err => console.log(err));
    }

    //gets order items and related products for a given order
    static getItemsProducts(orderId) {
        return db.execute(
            `SELECT orderitems.*, products.* FROM orderitems
            JOIN products ON products.id = orderitems.productId
            WHERE orderitems.orderId = ?`, [orderId]
        )
        .then(([result, metaData]) => {
            return result;
        })
        .catch(err => console.log(err));
    }
}