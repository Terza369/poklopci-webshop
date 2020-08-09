const db = require('../util/database');

module.exports = class Product {

    constructor(title, imageUrl, price, description, userId) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.price = price;
        this.description = description;
        this.userId = userId;
    }

    static fetchAll(userId = null) {
        if (userId) {
            return db.execute('SELECT * FROM products WHERE userId = ?', [userId])
                .then(([products, metaData]) => {
                    for(let i = 0; i < products.length; i++) {
                        products[i] = Object.assign(new Product(), products[i]);
                    }
                    return products;
                })
                .catch(err => console.log(err));
        } else {
            return db.execute('SELECT * FROM products')
                .then(([products, metaData]) => {
                    for(let i = 0; i < products.length; i++) {
                        products[i] = Object.assign(new Product(), products[i]);
                    }
                    return products;
                })
                .catch(err => console.log(err));
        }
    }

    static fetchAllLimited(pageNumber, userId = null) {
        if (userId) {
            return db.execute('SELECT * FROM products WHERE userId = ? LIMIT ?, ?', [userId, process.env.ITEMS_PER_PAGE * pageNumber, process.env.ITEMS_PER_PAGE])
                .then(([products, metaData]) => {
                    for(let i = 0; i < products.length; i++) {
                        products[i] = Object.assign(new Product(), products[i]);
                    }
                    return products;
                })
                .catch(err => console.log(err));
        } else {
            return db.execute('SELECT * FROM products LIMIT ?, ?', [process.env.ITEMS_PER_PAGE * pageNumber, process.env.ITEMS_PER_PAGE])
                .then(([products, metaData]) => {
                    for(let i = 0; i < products.length; i++) {
                        products[i] = Object.assign(new Product(), products[i]);
                    }
                    return products;
                })
                .catch(err => console.log(err));
        }
    }

    static findById(id) {
        return db.execute('SELECT * FROM products WHERE id = ?', [id])
            .then(([[product], metaData]) => {
                return Object.assign(new Product(), product);
            })
            .catch(err => console.log(err));
    }

    save() {
        return db.execute('INSERT INTO products (title, price, imageUrl, description, userId) VALUES (?, ?, ?, ?, ?)',
            [this.title, this.price, this.imageUrl, this.description, this.userId])
            .then(result => {
                this.id = result[0].insertId;
                return this;
            })
            .catch(err => console.log(err));
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
                .then(([[result], metaData]) => {
                    return result.count;
                })
                .catch(err => console.log(err));
        } else {
            return db.execute('SELECT COUNT(id) as count FROM products')
                .then(([[result], mestaData]) => {
                    return result.count;
                })
                .catch(err => console.log(err));
        }
    }
}