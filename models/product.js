const db = require('../util/database');


module.exports = class Product {

    static getItemsPerPage() {
        return 3;
    }

    constructor(title, imageUrl, price, description, userId) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.price = price;
        this.description = description;
        this.userId = userId;
    }

    static fetchAll(userId = null) {
        if (userId) {
            return db.execute('SELECT * FROM products WHERE userId = ?', [userId]);
        } else {
            return db.execute('SELECT * FROM products');
        }
    }

    static fetchAllLimited(pageNumber, userId = null) {
        if (userId) {
            return db.execute('SELECT * FROM products WHERE userId = ? LIMIT ?, ?', [userId, Product.getItemsPerPage() * pageNumber, Product.getItemsPerPage()]);
        } else {
            return db.execute('SELECT * FROM products LIMIT ?, ?', [Product.getItemsPerPage() * pageNumber, Product.getItemsPerPage()]);
        }
    }

    static findById(id) {
        return db.execute('SELECT * FROM products WHERE products.id = ?', [id]);
    }

    save() {
        return db.execute('INSERT INTO products (title, price, imageUrl, description, userId) VALUES (?, ?, ?, ?, ?)',
            [this.title, this.price, this.imageUrl, this.description, this.userId]);
    }

    update() {
        if(this.imageUrl) {
            return db.execute('UPDATE products SET title = ?, price = ?, imageURL = ?, description = ?, userId = ? WHERE id = ?',
                [this.title, this.price, this.imageUrl, this.description, this.userId, this.id]);
        } else {
            return db.execute('UPDATE products SET title = ?, price = ?, description = ?, userId = ? WHERE id = ?',
            [this.title, this.price, this.description, this.userId, this.id]);
        }
    }

    static deleteById(id) {
        return db.execute('DELETE FROM products WHERE products.id = ?', [id]);
    }

    static count(userId = null) {
        if(userId) {
            return db.execute('SELECT COUNT(id) as count FROM products WHERE userId = ?', [userId])
                .then(([[result], mestaData]) => {
                    return result.count;
                })
                .catch(err => next(err));
        } else {
            return db.execute('SELECT COUNT(id) as count FROM products')
                .then(([[result], mestaData]) => {
                    return result.count;
                })
                .catch(err => next(err));
        }
    }
}