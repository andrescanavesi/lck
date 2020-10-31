const moment = require('moment');
const fs = require('fs');
const path = require('path');

let staticResources = null;
/**
 *
 */
module.exports.getResponseJson = function (req) {
  // default attributes for the response response.
  const responseJson = {};
  responseJson.title = 'La Cocina de Kesman | LCK';
  responseJson.today = moment().format('YYYY-MM-DD');
  responseJson.isProduction = process.env.NODE_ENV === 'production' || false;
  responseJson.adsenseEnabled = process.env.LCK_ADSENSE_ENABLED || false;
  responseJson.isHomePage = false;
  responseJson.isRecipePage = false;
  responseJson.displayMoreRecipes = false;
  responseJson.createdAt = moment().format('YYYY-MM-DD');
  responseJson.updatedAt = moment().format('YYYY-MM-DD');
  responseJson.linkToThisPage = process.env.LCK_BASE_URL || 'http://localhost:3000';
  responseJson.description = 'lck';
  responseJson.metaImage = 'TBD';
  responseJson.keywords = 'TBD';
  responseJson.recipesSpotlight = [];
  responseJson.recipesMostVisited = [];
  responseJson.footerRecipes = [];
  responseJson.searchText = '';

  const metaCache = process.env.LCK_META_CACHE || '1'; // in seconds
  responseJson.metaCache = `public, max-age=${metaCache}`;

  responseJson.isUserAuthenticated = false;
  responseJson.isMobile = req.useragent.isMobile;
  responseJson.isDesktop = req.useragent.isDesktop;

  // structured data
  responseJson.pageType = 'Website';
  responseJson.pageName = 'lck';
  responseJson.pageOrganization = 'lck';
  responseJson.pageImage = process.env.LCK_DEFAULT_IMAGE_URL;
  responseJson.pageUrl = process.env.LCK_BASE_URL;
  responseJson.pageDatePublished = '2020-11-02';
  responseJson.pageDateModified = moment().format('YYYY-MM-DD');// today
  responseJson.pageLogo = process.env.LCK_FAV_ICON_URL;
  responseJson.pageDescription = responseJson.description;
  responseJson.pageRecipeVideo = process.env.LCK_DEFAULT_VIDEO_URL || 'https://www.youtube.com/watch?v=r4hXFYWhl8I';

  responseJson.enablePushEngage = false;

  responseJson.siteName = 'LCK';
  responseJson.author = 'LCK';
  responseJson.publisher = 'LCK';

  responseJson.googleAnalyticsId = process.env.LCK_GOOGLE_ANALYTICS_ID || '';
  responseJson.googleAdsenseId = process.env.LCK_GOOGLE_ADSENSE_ID || '';

  responseJson.facebookFanPageUrl = process.env.LCK_FACEBOOK_FAN_PAGE_URL || '#';
  responseJson.instagramUrl = process.env.LCK_INSTAGRAM_URL || '#';
  responseJson.currentYear = moment().format('YYYY');

  responseJson.lang = 'es';
  responseJson.locale = 'es_ES';

  responseJson.defaultLoadingImage = process.env.LCK_DEFAULT_LOADING_IMAGE;

  responseJson.imagesBaseUrl = process.env.LCK_IMAGES_BASE_URL;

  // load styles and js to print them directly into the body to reduce quantity of requests
  // in user's browser
  if (!staticResources) {
    const base = path.resolve(__dirname);
    let dir = path.join(base, '../public/stylesheets/styles.min.css');
    const styles = fs.readFileSync(dir, 'utf8'); // with 'utf8' it will read as a String instead of Buffer
    // TODO minify these styles https://www.npmjs.com/package/minify

    dir = path.join(base, '../public/stylesheets/bootstrap.min.css');
    const bootstrap = fs.readFileSync(dir, 'utf8');

    dir = path.join(base, '../public/javascripts/lozad.min.js');
    const lozad = fs.readFileSync(dir, 'utf8');

    dir = path.join(base, '../public/javascripts/track.min.js');
    const track = fs.readFileSync(dir, 'utf8');

    dir = path.join(base, '../public/javascripts/common.min.js');
    const common = fs.readFileSync(dir, 'utf8');

    // console.info(track);

    staticResources = {
      styles, lozad, track, common, bootstrap,
    };
  }

  responseJson.staticResources = staticResources;

  return responseJson;
};
