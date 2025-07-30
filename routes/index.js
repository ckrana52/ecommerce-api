var express = require('express');
var router = express.Router();
const db = require('../db');
const reportsRouter = require('./reports');
const authRouter = require('./auth');
const sliderRouter = require('./slider');
const usersRouter = require('./users');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/test-db', async function(req, res, next) {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS solution');
    res.json({ success: true, result: rows[0].solution });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.use('/reports', reportsRouter);
router.use('/auth', authRouter);
router.use('/sliders', sliderRouter);
router.use('/users', usersRouter);

module.exports = router;
