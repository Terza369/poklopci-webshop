const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mySQLSessionConstructor = require('express-mysql-session')(session);
const csrf = require('csurf')();
const flash = require('connect-flash')();
const multer = require('multer');
/* const helmet = require('helmet');*/
const compression = require('compression');
/*-----*/
const app = express();

const mySQLSessionStorage = new mySQLSessionConstructor({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    database: process.env.MYSQL_DATABASE,
    password: process.env.MYSQL_PASSWORD
});

const errorController = require('./controllers/error');
const shopController = require('./controllers/shop');
const isAuth = require('./middleware/is-auth');
const Cart = require('./models/cart');

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));

/* app.use(helmet());*/
app.use(compression());

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g , "-") + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));


app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/products/images', express.static(path.join(__dirname, 'images')));
app.use('/admin/images', express.static(path.join(__dirname, 'images')));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false, store: mySQLSessionStorage }));
app.use(flash);

app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn;
    next();
});

app.use((req, res, next) => {
    if(req.session.isLoggedIn) {
        Cart.get(req.session.user.id)
            .then(cart => {
                if(cart) {
                    next();
                } else {
                    cart = new Cart(req.session.user.id);
                    cart.save()
                        .then(() => {
                            next()
                        })
                        .catch(err => console.log(err));
                }
            })
            .catch(err => console.log(err));
    } else {
        next();
    }
});

app.post('/create-order', isAuth, shopController.postOrder);

app.use(csrf);
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

app.use((error, req, res, next) => {
    console.log(error);
    res.status(500).render('500', {
        pageTitle: 'Server error',
        path: '/500'
    });
});

app.listen(process.env.PORT || 3000);