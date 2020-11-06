const express = require('express');
const daoRecipies = require('../daos/dao_recipes');
const responseHelper = require('../utils/response_helper');

const router = express.Router();

async function loadRecipes(responseJson) {
  // eslint-disable-next-line no-param-reassign
  responseJson.latestRecipes = await daoRecipies.findWithLimit(3, true, true);
  // eslint-disable-next-line no-param-reassign
  responseJson.relatedRecipes = await daoRecipies.findWithLimit(6, true, true);
}

/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    responseJson.displayMoreRecipes = false;
    await loadRecipes(responseJson);

    const recipes = await daoRecipies.findWithLimit(18, true, true);

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
    const recipe = await daoRecipies.findByTitleSeo(req.params.titleSeo, true);
    const responseJson = responseHelper.getResponseJson(req);
    await loadRecipes(responseJson);
    responseJson.recipe = recipe;
    responseJson.title = recipe.title;
    responseJson.description = recipe.description;
    responseJson.linkToThisPage = recipe.url;
    responseJson.pageImage = recipe.featured_image_url;
    responseJson.pageDateModified = recipe.updated_at_friendly_2;
    responseJson.pageRecipeIngredients = JSON.stringify(recipe.ingredients);
    const instructions = [];
    for (let i = 0; i < recipe.steps_array.length; i++) {
      const step = { '@type': 'HowToStep', text: recipe.steps_array[i] };
      instructions.push(step);
    }

    responseJson.pageRecipeInstructions = JSON.stringify(instructions);
    responseJson.pageRecipeCategory = recipe.category;
    responseJson.pageDatePublished = recipe.created_at;
    responseJson.pageDateModified = recipe.updated_at;
    responseJson.pageRecipePrepTime = recipe.prep_time_seo;
    responseJson.pageRecipeCookTime = recipe.cook_time_seo;
    responseJson.pageRecipeTotalTime = recipe.total_time_seo;
    responseJson.pageRecipeCusine = recipe.cuisine;
    responseJson.pageRecipeYield = recipe.yield;
    responseJson.pageRecipeVideo = recipe.youtube_video_watch_url; // can be empty
    responseJson.aggregateRating = recipe.aggregate_rating;
    responseJson.ratingCount = recipe.rating_count;

    res.render('recipe', responseJson);
  } catch (e) {
    next(e);
  }
});

router.get('/videos', async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    await loadRecipes(responseJson);
    const recipes = await daoRecipies.findWithLimit(9, true, true);

    responseJson.recipes = recipes;
    res.render('videos', responseJson);
  } catch (e) {
    next(e);
  }
});

router.get('/sobre-mi', async (req, res, next) => {
  try {
    const responseJson = responseHelper.getResponseJson(req);
    await loadRecipes(responseJson);

    res.render('sobre-mi', responseJson);
  } catch (e) {
    next(e);
  }
});
module.exports = router;
