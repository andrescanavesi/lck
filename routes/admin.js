const express = require('express');
const basicAuth = require('express-basic-auth');
const csrf = require('csurf');
const bodyParser = require('body-parser');
const daoRecipes = require('../daos/dao_recipes');
const responseHelper = require('../utils/response_helper');
const cloudinaryHelper = require('../utils/cloudinary_helper');

const { Logger } = require('../utils/Logger');

const log = new Logger('router_admin');

const router = express.Router();

let csrfProtection;

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  // we are more flexible in development and testing
  csrfProtection = csrf({
    cookie: true,
  });
} else {
  csrfProtection = csrf({
    cookie: true, signed: true, secure: true, httpOnly: true, sameSite: 'strict',
  });
}

const parseForm = bodyParser.urlencoded({ extended: false });

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
router.get('/', csrfProtection, basicAuth(authOptions), async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    responseJson.csrfToken = req.csrfToken();
    const recipes = await daoRecipes.findWithLimit(9);

    responseJson.recipes = recipes;
    responseJson.layout = 'layout-admin';
    res.render('admin', responseJson);
  } catch (e) {
    next(e);
  }
});

router.get('/receta/nueva', csrfProtection, basicAuth(authOptions), (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    responseJson.csrfToken = req.csrfToken();
    const recipe = daoRecipes.getRecipeDefaults();
    responseJson.layout = 'layout-admin';
    responseJson.action = '/admin/receta/editar/0';
    responseJson.recipe = recipe;
    res.render('recipe-edit', responseJson);
  } catch (e) {
    next(e);
  }
});

router.get('/receta/editar/:id', csrfProtection, basicAuth(authOptions), async (req, res, next) => {
  try {
    const recipe = await daoRecipes.findById(req.params.id, true, false);
    const responseJson = responseHelper.getResponseJson(req);
    responseJson.recipe = recipe;
    responseJson.csrfToken = req.csrfToken();
    responseJson.action = recipe.url_edit;
    responseJson.layout = 'layout-admin';
    res.render('recipe-edit', responseJson);
  } catch (e) {
    next(e);
  }
});

/**
 * Updates a recipe by id
 */
router.post('/receta/editar/:id', parseForm, csrfProtection, basicAuth(authOptions), async (req, res, next) => {
  try {
    // const recipe = await daoRecipes.findById(req.params.id, true, false);

    const recipe = daoRecipes.getRecipeDefaults();
    recipe.title = req.body.title;
    recipe.description = req.body.description;
    recipe.ingredients = req.body.ingredients;
    recipe.steps = req.body.steps;
    recipe.tags_csv = req.body.tags;
    recipe.youtube_video_id = req.body.youtube_video_id;

    recipe.id = req.params.id;
    if (recipe.id === '0') recipe.id = await daoRecipes.create(recipe);
    else await daoRecipes.update(recipe);

    const recipeStored = await daoRecipes.findById(recipe.id, true, false);

    res.redirect(recipeStored.url_edit);
  } catch (e) {
    next(e);
  }
});

router.post('/receta/imagen/:recipeId', basicAuth(authOptions), async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No se ha seleccionado ninguna imagen');
    }
    const { recipeId } = req.params;
    const imageName = await cloudinaryHelper.uploadFile(req.files.image, recipeId);
    const recipeStored = await daoRecipes.findById(recipeId, true, false);
    await daoRecipes.addImage(recipeId, imageName);
    res.redirect(recipeStored.url_edit);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
