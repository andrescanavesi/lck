const express = require('express');
const basicAuth = require('express-basic-auth');
const daoRecipies = require('../daos/dao_recipes');
const responseHelper = require('../utils/response_helper');

const router = express.Router();

/**
 *
 * @returns {string} the text to be displayed when users hit on cancel prompt button
 */
function getUnauthorizedResponse() {
  return 'Unauthorized';
}

// http auth basic options
const authOptions = {
  challenge: true, // it will cause most browsers to show a popup to enter credentials on unauthorized responses,
  users: { admin: process.env.LCK_HTTP_AUTH_BASIC_PASSWORD },
  authorizeAsync: false,
  unauthorizedResponse: getUnauthorizedResponse,
};

/* GET home page. */
router.get('/', basicAuth(authOptions), async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    const recipes = await daoRecipies.findWithLimit(9);

    responseJson.recipes = recipes;
    res.render('admin', responseJson);
  } catch (e) {
    next(e);
  }
});

router.get('/receta/editar/:id', basicAuth(authOptions), (req, res, next) => {
  try {
    res.render('index', { title: 'Express' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
