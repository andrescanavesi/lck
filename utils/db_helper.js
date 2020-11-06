const parseDbUrl = require('parse-database-url');
const { Pool } = require('pg');
const NodeCache = require('node-cache');

const { Logger } = require('./Logger');

const log = new Logger('db_helper');

let cacheOptions;
// stdTTL: the standard ttl as number in seconds for every generated cache element.
// checkperiod: (default: 600) The period in seconds, as a number, used for the automatic delete check interval. 0 = no periodic check.
// maxKeys: (default: -1) specifies a maximum amount of keys that can be stored in the cache. If a new item is set and the cache is full, an error is thrown and the key will not be saved in the cache. -1 disables the key limit.
if (process.env.NODE_ENV !== 'production') {
  cacheOptions = { stdTTL: 5, checkperiod: 5, maxKeys: 1000 };
} else {
  cacheOptions = { stdTTL: 60 * 60, checkperiod: 120, maxKeys: 1000 };
}

const queryCache = new NodeCache(cacheOptions);

let ssl = null;
let dbConfig;
if (process.env.NODE_ENV === 'development') {
  if (!process.env.LCK_DATABASE_URL) throw new Error('LCK_DATABASE_URL env var was not set');
  dbConfig = parseDbUrl(process.env.LCK_DATABASE_URL);
  ssl = { rejectUnauthorized: false };
} else {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL env var was not set');
  dbConfig = parseDbUrl(process.env.DATABASE_URL);
}

const pool = new Pool({
  user: dbConfig.user,
  host: dbConfig.host,
  database: dbConfig.database,
  password: dbConfig.password,
  port: dbConfig.port,
  ssl,
});

/**
 *
 * @param {string} theQuery
 * @param {[]]} bindings
 * @param {boolean} withCache true to cache the result
 * @return {Promise<*>}
 */
async function query(theQuery, bindings, withCache) {
  if (withCache) {
    // log.info(`executing query with cache ${theQuery}`);
    const key = theQuery + JSON.stringify(bindings);
    const value = queryCache.get(key);
    if (value === undefined) {
      try {
        log.info('no cache for this query, will go to the DB');
        const queryResult = await pool.query(theQuery, bindings);
        queryCache.set(key, queryResult);
        return queryResult;
      } catch (error) {
        throw new Error(`Error executing query with cache ${theQuery} error: ${error}`);
      }
    } else {
      // log.info(`returning query result from cache ${theQuery}`);
      // log.info(queryCache.getStats());
      return value;
    }
  } else {
    try {
      // log.info(`executing query without cache ${theQuery}`);
      const result = await pool.query(theQuery, bindings);

      // delete all the cache content if we are inserting or updating data
      const auxQuery = theQuery.trim().toLowerCase();
      if (auxQuery.startsWith('insert') || auxQuery.startsWith('update')) {
        queryCache.flushAll();
        queryCache.flushStats();
        log.info(`the cache was flushed because of the query ${theQuery}`);
      }
      return result;
    } catch (error) {
      throw new Error(`Error executing query without cache  ${theQuery} error: ${error}`);
    }
  }
}

module.exports.execute = pool;
module.exports.query = query;
