const express = require('express');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  try {
    res.render('index', { title: 'Express' });
  } catch (e) {
    next(e);
  }
});

router.get('/receta/editar/:id', (req, res, next) => {
  try {
    res.render('index', { title: 'Express' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
