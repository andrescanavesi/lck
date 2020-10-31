const moment = require('moment');

moment.locale('es');

const FlexSearch = require('flexsearch');
const dbHelper = require('../utils/db_helper');
const { Logger } = require('../utils/Logger');
const utils = require('../utils/utils');

const log = new Logger('dao_recipes');

const preset = 'fast';
const searchIndex = new FlexSearch(preset);

function convertRecipe(row) {

}
