import request from 'request';
const conf = require('../conf');

/**
 * send a request
 * @param method
 * @param path
 * @param data
 * @returns {Promise}
 */
export function send(method, path, data) {
  return new Promise(function(resolve, reject) {
    request({
      method: method || 'get',
      url: `http://localhost:${conf.PORT}${path}`,
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    })
      .on('data', res => resolve(JSON.parse(res.toString())))
      .on('error', err => reject(err));
  });
}