const db = require('../util/database');
const CartItem = require('../models/cart-item');
const OrderItem = require('../models/order-item');

module.exports = class Order {
    constructor(userId) {
        this.userId = userId;
    }

    //saves the object to the database
    //and attaches the designated ID property to it
    save() {
        return db.execute(
            `INSERT INTO orders(userId) values(?)`, [this.userId]
        )
        .then(result => {
            this.id = result[0].insertId;
        })
        .catch(err => console.log(err));
    }

    //returns a single order ID for a given user
    static getOrder(userId) {
        return db.execute(
            `SELECT id FROM orders WHERE userId = ?`, [userId]
        )
        .then(([[result], metaData]) => {
            return result.id;
        })
        .catch(err => console.log(err));
    }

    // returns an array of order IDs for a given user
    static getOrders(userId) {
        return db.execute(
            `SELECT * FROM orders
            WHERE orders.userId = ?`, [userId]
        )
        .then(([result, metaData]) => {
            let orderIdArray = [];
            for ( let i of result) {
                orderIdArray.push(i.id);
            }
            return orderIdArray;
        })
        .catch(err => console.log(err));
    }

    //returns a user ID associated to the order
    static getUserId(orderId) {
        return db.execute(
            `SELECT userId FROM orders WHERE id = ?`, [orderId]
        )
        .then(([[result], metaData]) => {
            return result.userId;
        })
        .catch(err => console.log(err));
    }
}