const express = require('express');
const daoRecipies = require('../daos/dao_recipes');
const responseHelper = require('../utils/response_helper');

const router = express.Router();

/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    responseJson.displayMoreRecipes = false;

    const recipes = await daoRecipies.findAll();
    // const recipesMostVisited = await daoRecipies.findRecipesMostVisited();
    // responseJson.recipesMostVisited = recipesMostVisited;

    if (!recipes) {
      throw Error('No se han encontrado recetas');
    }

    responseJson.recipes = recipes;
    responseJson.isHomePage = true;
    responseJson.searchText = '';
    res.render('index', responseJson);
  } catch (e) {
    next(e);
  }
});

router.get('/receta/:titleSeo', async (req, res, next) => {
  try {
    // logger.info(`title seo: ${req.params.titleSeo}`);
    const recipe = await daoRecipies.findByTitleSeo(req.params.titleSeo);
    const responseJson = responseHelper.getResponseJson(req);
    responseJson.recipe = recipe;
    responseJson.title = recipe.title;
    responseJson.description = recipe.description;
    responseJson.linkToThisPage = recipe.url;
    responseJson.pageImage = recipe.featured_image_url;
    responseJson.pageDateModified = recipe.updated_at_friendly_2;

    const recipes = await daoRecipies.findAll();
    responseJson.relatedRecipes = recipes;

    res.render('recipe', responseJson);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
