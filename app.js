require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var categoriesRouter = require('./routes/categories');
var productsRouter = require('./routes/products');
var authRouter = require('./routes/auth');
var ordersRouter = require('./routes/orders');
var customersRouter = require('./routes/customers');
var reviewsRouter = require('./routes/reviews');
var sliderRouter = require('./routes/slider');
var pagesRouter = require('./routes/pages');
var settingsRouter = require('./routes/settings');
var couriersRouter = require('./routes/couriers');
var citiesRouter = require('./routes/cities');
var zonesRouter = require('./routes/zones');
var smsRouter = require('./routes/sms');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/api', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/customers', customersRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/slider', sliderRouter);
app.use('/api/pages', pagesRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/couriers', couriersRouter);
app.use('/api/cities', citiesRouter);
app.use('/api/zones', zonesRouter);

// Add debugging to see all registered routes
// app._router.stack.forEach(function(r){
//   if (r.route && r.route.path){
//     console.log('Route:', r.route.path, 'Methods:', Object.keys(r.route.methods));
//   }
// });

app.use('/api/sms', smsRouter);
app.use('/uploads', express.static('uploads'));

module.exports = app;
