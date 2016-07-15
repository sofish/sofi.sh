import bcrypt from 'bcrypt';
import shortid from 'shortid';
import httpAssert from 'http-assert';
import * as Helper from './helper';

const SALT_ROUND = 10;

/**
 * Get collection from db
 * @param ctx
 * @param collectionName
 * @returns {Object}
 */
export function collection(ctx, collectionName) {
  var db = ctx.app.context.db;
  httpAssert(db, 503);
  return db.collection(collectionName);
};

/**
 * Hash a string
 * @returns {Object}
 */
export function hash(key) {
  return bcrypt.hashSync(key, SALT_ROUND);
}

/**
 * compare origin data with hash
 * @param origin
 * @param hash
 */
export function compare(origin, hash) {
  return bcrypt.compareSync(origin, hash);
}

/**
 * Compose a new object base on the schema and origin object
 * @param obj
 * @param schema
 * @returns {Object} error / result object
 */
export function composeWithSchema(obj, schema) {
  var ret = {};
  for (let key in schema) {
    let tmp = validSchema(key, obj, schema);

    // ignore
    if(!tmp) continue;

    // hard core for `password`
    ret[key] = key === 'password' ? hash(tmp.value) : tmp.value;
  }

  // add shortid and createdAt
  ret.id = shortid.generate();
  ret.createdAt = new Date();
  ret.lastModified = new Date();

  return ret;
}

/**
 * valid schema
 * @param key
 * @param obj
 * @param schema
 * @returns {*}
 */
export function validSchema(key, obj, schema) {
  // ignore
  if(!schema.hasOwnProperty(key)) return null;

  switch (true) {
    // required
    case schema[key].required && !obj.hasOwnProperty(key):
      httpAssert(false, 500, `\`${key}\` is required`);

    // check type
    case obj.hasOwnProperty(key) && !Helper.compareType(schema[key].type(), obj[key]):
      httpAssert(false, 500, `\`${key}\` should be a ${Helper.is(schema[key].type())}`);

    // check length
    case obj.hasOwnProperty(key) && schema[key].length:
      checkLength(obj[key], schema[key].length, key);

    // check pattern
    case obj.hasOwnProperty(key) && schema[key].pattern:
      httpAssert(schema[key].pattern.test(obj[key]), 500, schema[key].message || `\`${key}\` is not valid`);

    // default value
    case !obj.hasOwnProperty(key) && schema[key].hasOwnProperty('default'):
      obj[key] = schema[key].default;
  }

  return {key: key, value: obj[key]};
}


/**
 * check if str.length is in range
 * @param str
 * @param range
 * @returns {*}
 */
function checkLength(str, range, key) {
  if(!range.length) return true;
  var [min, max] = range;
  min = min ? (str.length >= min) : true;
  max = max ? (str.length <= max) : true;
  assert(min && max, 500, `\`${key}\` length is too ${!min ? 'short' : 'long'}`);
}