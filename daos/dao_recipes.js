const moment = require('moment');

moment.locale('es');

const FlexSearch = require('flexsearch');
const dbHelper = require('../utils/db_helper');
const { Logger } = require('../utils/Logger');
const utils = require('../utils/utils');

const log = new Logger('dao_recipes');

const preset = 'fast';
const searchIndex = new FlexSearch(preset);

let allRecipes = [];

function convertRecipe(row) {
  const imageBase = process.env.LCK_IMAGES_BASE_URL;
  const featuredImageBase = imageBase;
  const thumbnailImageBase = imageBase.replace('w_900', 'w_400');
  const thumbnail200ImageBase = imageBase.replace('w_900', 'w_200').replace('h_600', 'h_150');
  const thumbnail500ImageBase = imageBase.replace('w_900', 'w_500').replace('h_600', 'h_300');
  const thumbnail300ImageBase = imageBase.replace('w_900', 'w_300').replace('h_600', 'h_200');

  // const featured_image_name = row.featured_image_name.replace("jpg", "webp");
  const imagesNames = row.images_names_csv.split(',');
  const featuredImageName = imagesNames[0];

  const recipe = {};
  recipe.id = row.id;
  recipe.title = row.title;
  recipe.description = row.description;

  recipe.featured_image_name = featuredImageName;
  recipe.featured_image_url = featuredImageBase + featuredImageName;
  recipe.featured_image_url_mobile = thumbnail500ImageBase + featuredImageName;
  recipe.thumbnail500 = thumbnail500ImageBase + featuredImageName;
  recipe.thumbnail300 = thumbnail300ImageBase + featuredImageName;
  recipe.thumbnail = thumbnailImageBase + featuredImageName;
  recipe.thumbnail200 = thumbnail200ImageBase + featuredImageName;

  recipe.ingredients = row.ingredients;
  // remove empty new lines with filter
  recipe.ingredients_array = row.ingredients.split('\n').filter((item) => item && item.length > 0 && item.trim() !== '');

  recipe.has_extra_ingredients = row.extra_ingredients_title !== null && row.extra_ingredients_title.trim() !== '';
  if (recipe.has_extra_ingredients) {
    recipe.extra_ingredients_title = row.extra_ingredients_title;
    recipe.extra_ingredients = row.extra_ingredients;
    // remove empty new lines with filter
    recipe.extra_ingredients_array = row.extra_ingredients.split('\n').filter((item) => item && item.length > 0 && item.trim() !== '');
  }

  recipe.steps = row.steps;
  // remove empty new lines with filter
  recipe.steps_array = row.steps.split('\n').filter((item) => item && item.length > 0 && item.trim() !== '');

  recipe.title_seo = row.title_seo;

  const enFormat = 'YYYY-MM-DD';
  recipe.created_at = moment(row.created_at, enFormat);
  recipe.created_at = recipe.created_at.format(enFormat);
  recipe.created_at_es = `Publicada ${moment(row.created_at, enFormat).startOf('day').fromNow()}`;

  recipe.updated_at = moment(row.updated_at, enFormat);
  recipe.updated_at = recipe.updated_at.format(enFormat);

  recipe.url = `${process.env.LCK_BASE_URL}/receta/${recipe.id}/${recipe.title_seo}`;
  recipe.url_edit = `${process.env.LCK_BASE_URL}/admin/receta/editar/${recipe.id}/`;
  recipe.active = row.active;
  recipe.notes = row.notes;
  recipe.has_notes = recipe.notes && recipe.notes.trim() !== '';
  recipe.youtube_video_id = row.youtube_video_id;
  recipe.has_youtube_video = recipe.youtube_video_id !== null && recipe.youtube_video_id.trim() !== '';
  if (recipe.has_youtube_video) {
    recipe.youtube_video_embed_url = `https://www.youtube.com/embed/${row.youtube_video_id}`;
    recipe.youtube_video_watch_url = `https://www.youtube.com/watch?v=${row.youtube_video_id}`;
  }

  // social sharing buttons
  recipe.pinterestSharingUrl = `https://www.pinterest.com/pin/create/button/?url=${
    recipe.url
  }&media=${
    recipe.thumbnail
  }&description=${
    recipe.description}`;
  recipe.whatsappSharingUrl = `whatsapp://send?text=${recipe.url}`;
  recipe.facebookSharingUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURI(recipe.url)}`;
  const twitterUrl = encodeURI(`${recipe.url}&text=${recipe.title}`);
  recipe.twitterSharingUrl = `https://twitter.com/intent/tweet?url=${twitterUrl}`;

  recipe.prep_time_seo = row.prep_time_seo || 'PT20M';
  recipe.cook_time_seo = row.cook_time_seo || 'PT30M';
  recipe.total_time_seo = row.total_time_seo || 'PT50M';
  recipe.prep_time = row.prep_time || '20 minutos';
  recipe.cook_time = row.cook_time || '30 minutos';
  recipe.total_time = row.total_time || '50 minutos';
  recipe.cuisine = row.cuisine || 'Americana';
  recipe.yield = row.yield || '5 porciones';

  recipe.aggregate_rating = row.aggregate_rating || 4.3;
  recipe.rating_count = row.rating_count || 22;

  recipe.default_loading_image = process.env.LCK_DEFAULT_LOADING_IMAGE;
  recipe.default_thumb_loading_image = process.env.LCK_DEFAULT_THUMB_LOADING_IMAGE;

  recipe.tags_csv = row.tags_csv || 'facil';
  recipe.tags_array = recipe.tags_csv.split(',');

  let i = 0;
  recipe.tags_array_3 = []; // contains maximum 3 keywords for SEO and UI purposes
  while (i < 3) {
    recipe.tags_array_3.push(recipe.tags_array[i]);
    i++;
  }

  // recipe.images_names_csv = 'masa-tartas-saladas.png, recipe-default-2.jpg';
  recipe.images_names_csv = row.images_names_csv || process.env.LCK_DEFAULT_LOADING_IMAGE;
  recipe.images_urls = [];
  if (recipe.images_names_csv && recipe.images_names_csv.length > 0) {
    recipe.images_urls = recipe.images_names_csv.split(',').map((image) => imageBase + image.trim());
  }

  return recipe;
}

async function findWithLimit(limit) {
  log.info(`findWithLimit, limit: ${limit}`);
  const query = 'SELECT * FROM recipes WHERE active=true ORDER BY created_at DESC LIMIT $1 ';
  const bindings = [limit];

  const result = await dbHelper.query(query, bindings, true);
  log.info(`recipes: ${result.rows.length}`);
  const recipes = [];
  for (let i = 0; i < result.rows.length; i++) {
    recipes.push(convertRecipe(result.rows[i]));
  }
  return recipes;
}

module.exports.resetCache = async function () {
  allRecipes = [];
  await this.buildSearchIndex();
};

module.exports.findAll = async function () {
  if (allRecipes.length === 0) {
    allRecipes = findWithLimit(1000);
  }
  return allRecipes;
};

async function findWithTag(tag) {
  // TODO
  return [];
}

/**
 *
 * @param {number} id
 * @param {boolean} ignoreActive true to find active true and false
 * @param {boolean} witchCache
 */
module.exports.findById = async function (id, ignoreActive, witchCache = true) {
  if (!id) {
    throw Error('id param not defined');
  }
  let query;
  if (ignoreActive === true) {
    query = 'SELECT * FROM recipes WHERE id = $1 LIMIT 1';
  } else {
    query = 'SELECT * FROM recipes WHERE active=true AND id = $1 LIMIT 1';
  }

  const bindings = [id];
  // log.info(sqlFormatter.format(query));
  log.info(`findById, bindings: ${bindings}`);
  const result = await dbHelper.query(query, bindings, witchCache);
  if (result.rows.length > 0) {
    const recipe = convertRecipe(result.rows[0]);
    return recipe;
  }
  throw Error(`receta no encontrada ${id}`);
};

async function findByIds(ids) {
  if (!ids) {
    throw Error('ids param not defined');
  }
  log.info('findByIds');
  // log.info(ids);
  for (let i = 0; i < ids.length; i++) {
    if (isNaN(ids[i])) {
      throw new Error(`Seems '${ids[i]}' is not a number`);
    }
  }
  // in this case we concatenate string instead of using bindings. Something to improve
  const query = `SELECT * FROM recipes WHERE active=true AND id IN (${ids}) LIMIT 100`;
  const bindings = [];
  // log.info(sqlFormatter.format(query));
  // log.info("bindings: " + bindings);
  const result = await dbHelper.query(query, bindings, true);
  const recipes = [];
  for (let i = 0; i < result.rows.length; i++) {
    recipes.push(convertRecipe(result.rows[i]));
  }
  return recipes;
}

module.exports.create = async function (recipe) {
  // upper case only the first letter. The resto will be lower case
  // eslint-disable-next-line no-param-reassign
  recipe.title = recipe.title.charAt(0).toUpperCase() + recipe.title.toLowerCase().slice(1);
  log.info(`Creating recipe: ${recipe.title}`);

  const today = moment().format('YYYY-MM-DD HH:mm:ss');
  const query = `INSERT INTO recipes(
    created_at, 
    updated_at, 
    title, 
    title_seo, 
    description, 
    ingredients, 
    extra_ingredients_title,
    extra_ingredients, 
    steps, 
    active, 
    prep_time_seo, 
    cook_time_seo,
    total_time_seo, 
    prep_time,
    cook_time, 
    total_time, 
    cuisine, 
    yield, 
    notes, 
    youtube_video_id, 
    aggregate_rating,
    rating_count,
    images_names_csv, 
    tags_csv)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24) 
    RETURNING id`;
  const bindings = [
    today,
    today,
    recipe.title,
    recipe.title_seo,
    recipe.description,
    recipe.ingredients,
    recipe.extra_ingredients_title,
    recipe.extra_ingredients,
    recipe.steps,
    recipe.active,
    recipe.prep_time_seo,
    recipe.cook_time_seo,
    recipe.total_time_seo,
    recipe.prep_time,
    recipe.cook_time,
    recipe.total_time,
    recipe.cuisine,
    recipe.yield,
    recipe.notes,
    recipe.youtube_video_id,
    recipe.aggregate_rating,
    recipe.rating_count,
    recipe.images_names_csv,
    recipe.tags_csv,
  ];
  log.info('insert bindings', bindings);

  const result = await dbHelper.query(query, bindings, false);

  const recipeId = result.rows[0].id;
  log.info(`Recipe created: ${recipeId}`);

  await this.resetCache();
  return recipeId;
};

/**
 * @param recipe
 */
module.exports.update = async function (recipe) {
  log.info('updating recipe...');
  const today = moment().format('YYYY-MM-DD HH:mm:ss');
  const query = `UPDATE recipes SET ingredients=$1, steps=$2, updated_at=$3, active=$4,
      extra_ingredients_title=$5, title=$6, description=$7, title_seo=$8, 
      prep_time_seo=$9, cook_time_seo=$10, total_time_seo=$11, 
     prep_time=$12, cook_time=$13, total_time=$14, cuisine=$15, yield=$16,
     youtube_video_id=$17,notes=$18, 
     extra_ingredients=$19,aggregate_rating=$20,rating_count=$21,images_names_csv=$22,
     tags_csv=$23
       WHERE id=$24`;
  const bindings = [
    recipe.ingredients,
    recipe.steps,
    today,
    recipe.active,
    recipe.extra_ingredients_title,
    recipe.title,
    recipe.description,
    recipe.title_seo,
    recipe.prep_time_seo,
    recipe.cook_time_seo,
    recipe.total_time_seo,
    recipe.prep_time,
    recipe.cook_time,
    recipe.total_time,
    recipe.cuisine,
    recipe.yield,
    recipe.youtube_video_id,
    recipe.notes,
    recipe.extra_ingredients,
    recipe.aggregate_rating,
    recipe.rating_count,
    recipe.images_names_csv,
    recipe.tags_csv,
    recipe.id,
  ];
    // log.info(sqlFormatter.format(query));
    // log.info(bindings);
  const result = await dbHelper.query(query, bindings, false);
  // log.info(result);
  await this.resetCache();
  return result;
};

module.exports.buildSearchIndex = async function () {
  // console.time('buildIndexTook');
  log.info('building index...');

  const all = await this.findAll();

  const size = all.length;
  for (let i = 0; i < size; i++) {
    // we might concatenate the fields we want for our content
    const content = `${all[i].title} ${all[i].description} ${all[i].tags_csv}`;
    const key = parseInt(all[i].id);
    searchIndex.add(key, content);
  }
  log.info(`index built, length: ${searchIndex.length}`);
  // console.timeEnd('buildIndexTook');
};

module.exports.findRelatedByTags = async function (tagsCsv) {
  // TODO
  return [];
};
/**
 * @param {string} text to search
 */
module.exports.findRelated = async function (text) {
  log.info(`look for related results with: ${text}`);
  if (this.searchIndex.length === 0) {
    await this.buildSearchIndex();
  }

  const resultIds = await this.searchIndex.search({
    query: text,
    limit: 12,
    suggest: true, // When suggestion is enabled all results will be filled up (until limit, default 1000) with similar matches ordered by relevance.
  });

  log.info(`related results: ${resultIds.length}`);
  let results;
  if (resultIds.length === 0) {
    // results = await this.findRecipesSpotlight();
    results = []; // TODO
  } else {
    results = await this.findByIds(resultIds);
  }

  if (results.length < 5) {
    log.info('not enough related recipes, result will filled up with more recipes');
    const moreRecipes = await findWithLimit(20);
    results = results.concat(moreRecipes);
  }

  return results;
};

module.exports.deleteDummyData = async function () {
  const query = "DELETE FROM recipes WHERE title_seo = 'from-test'";
  const result = await dbHelper.query(query, [], false);
  // log.info(result);
};

module.exports.findRandom = async function (limit) {
  // this collection is cached, that's we take 200 records and then shuffle
  const all = await findWithLimit(200);
  const shuff = utils.shuffle(all);
  return shuff.slice(0, limit - 1);
};

module.exports.findByIds = findByIds;
module.exports.searchIndex = searchIndex;
