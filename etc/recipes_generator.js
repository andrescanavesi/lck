const envs = require('dotenv').config();
const daoRecipes = require('../daos/dao_recipes');
const utils = require('../utils/utils');

async function createRecipes() {
  const recipes = ['Galletitas de manteca', 'Torta de jamón y queso con masa batida',
    'Muffins con chips de chocolate', 'Budin de banana', 'Pan casero en asadera con chimenea',
    'Torta de vainilla esponjosa', 'Galletitas dulces sin azucar y sin TACC',
    'Galletitas de maicena', 'Brownie sin TACC'];
  const promises = [];
  for (let i = 0; i < recipes.length; i++) {
    const title = recipes[i];
    const titleSeo = utils.dashString(title);
    const recipe = {
      title,
      title_seo: titleSeo,
      description:
              'Lorem ipsum dolor sit amet consectetur adipiscing elit penatibus morbi tempor, nibh elementum class dapibus litora ridiculus pellentesque ut massa, faucibus nascetur ullamcorper aptent augue malesuada mus tempus velit. ',
      ingredients:
              'Lorem ipsum dolor sit amet\nLorem ipsum dolor sit amet\nLorem ipsum dolor sit amet\nLorem ipsum dolor sit amet\nLorem ipsum dolor sit amet',
      steps:
              'adipiscing elit penatibus morbi tempor, nibh elementum class dapibus litora ridiculus pellentesque ut massa\nadipiscing elit penatibus morbi tempor, nibh elementum class dapibus litora ridiculus pellentesque ut massa\nadipiscing elit penatibus morbi tempor, nibh elementum class dapibus litora ridiculus pellentesque ut massa\nadipiscing elit penatibus morbi tempor, nibh elementum class dapibus litora ridiculus pellentesque ut massa\nadipiscing elit penatibus morbi tempor, nibh elementum class dapibus litora ridiculus pellentesque ut massa',
      active: true,
      prep_time_seo: 'PT20M',
      cook_time_seo: 'PT30M',
      total_time_seo: 'PT50M',
      prep_time: '20 minutos',
      cook_time: '30 minutos',
      total_time: '50 minutos',
      cuisine: 'Americana',
      yield: '5 porciones',
      notes: 'Lorem ipsum dolor sit amet\nLorem ipsum dolor sit amet',
      extra_ingredients_title: 'extra title',
      extra_ingredients: 'Lorem ipsum\n dolor sit amet\nLorem ipsum\n dolor sit amet',
      youtube_video_id: 'cEWz-iCSGsk',
      aggregate_rating: 4.1,
      rating_count: 97,
      images_names_csv: 'recipe-default.png',
      tags_csv: 'a,b,c',
    };
    promises.push(daoRecipes.create(recipe));
  }

  await Promise.all(promises);
}

createRecipes(10).then(() => console.info('done')).catch((err) => console.error(err));
