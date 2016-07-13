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
 * @param schema
 * @param obj
 * @returns {Object} error / result object
 */
export function composeWithSchema(schema, obj) {
  var ret = {};
  for (let key in schema) {
    switch (true) {
      // required
      case schema[key].required && !obj.hasOwnProperty(key):
        this.throw(500, `\`${key}\` is required`);

      // check type
      case schema[key].required && !Helper.compareType(schema[key].type(), obj[key]):
        this.throw(500, `\`${key}\` should be a ${Helper.is(schema[key].type())}`);

      // default value
      case !obj.hasOwnProperty(key):
        ret[key] = schema[key].default;
    }

    // ignore
    if(Helper.is(obj[key]) === 'Undefined') continue;

    // hard core for `password`
    ret[key] = key === 'password' ? hash(obj[key]) : obj[key];
  }

  // add shortid and createdAt
  ret.id = shortid.generate();
  ret.createdAt = new Date();
  ret.lastModified = new Date();

  return ret;
}

export function validSchema(key, value, schema) {
  // ignore
  if(!schema.hasOwnProperty(key)) return null;

  var type = schema[key].type;
  httpAssert(type && Helper.is(value) === type.name, 500, `\`${key}\` should be a(n) ${type.name}`);
  return {key: key, value: value};
}