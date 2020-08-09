const db = require('../util/database');

module.exports = class User {
    constructor(email, password) {
        this.email = email;
        this.password = password;
    }
    
    save() {
        return db.execute('INSERT INTO users (email, password) VALUES (?, ?)',
            [this.email, this.password])
            .then(result => {
                this.id = result[0].insertId;
                return this;
            })
            .catch(err => console.log(err));
    }

    setToken(resetToken) {
        return db.execute(`UPDATE users SET resetToken = ?, resetTokenExpiration = ADDTIME(CURRENT_TIMESTAMP(), '3:0:0') WHERE id = ?`,
            [resetToken, this.id]);
    }

    static findById(id) {
        return db.execute('SELECT * FROM users WHERE id = ?', [id])
            .then(([[user], metaData]) => {
                return Object.assign(new User(), user);
            })
            .catch(err => console.log(err));
    }

    static findByEmail(email) {
        return db.execute('SELECT * FROM users WHERE email = ?', [email])
            .then(([[user], metaData]) => {
                if(user) {
                    return Object.assign(new User(), user);
                } else {
                    return null;
                }
            })
            .catch(err => console.log(err));
    }

    static findByToken(resetToken) {
        return db.execute(`SELECT * FROM users WHERE resetToken = ? AND resetTokenExpiration > ADDTIME(CURRENT_TIMESTAMP(), '2:0:0')`, [resetToken])
            .then(([[user], metaData]) => {
                return Object.assign(new User(), user);
            })
            .catch(err => console.log(err));
    }

    static setNewPassword(userId, password, token) {
        return db.execute(`UPDATE users SET password = ? WHERE id = ? AND resetToken = ? AND resetTokenExpiration > CURRENT_TIMESTAMP()`,
            [password, userId, token])
            .then(() => {
                return db.execute(`UPDATE users SET resetToken = ?, resetTokenExpiration = ? WHERE id = ?`,
                    [null, null, userId]);
            })
            .catch(err => console.log(err));
    }

    static existsByEmail(email) {
        return db.execute(
            `SELECT * FROM users WHERE email = ?`, [email]
        )
        .then(([[result], metaData]) => {
            if(result) {
                return true;
            } else {
                return false;
            }
        })
        .catch(err => console.log(err));
    }

}