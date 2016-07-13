/**
 * Remove private keys from obj
 * @param keys
 * @param obj
 * @returns {Object}
 */
export function filter(keys, obj) {
  var ret = {};
  for(let key in obj) {
    if(keys.indexOf(key) === -1) ret[key] = obj[key];
  }
  return ret;
}

/**
 * Compare type of two variable
 * @param a
 * @param b
 * @returns {boolean}
 */
export function compareType(a, b) {
  return is(a) === is(b);
}

/**
 * Detect variable type
 * @param obj
 * @returns {string}
 */
export function is(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1);
}