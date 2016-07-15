// import * as request from 'request';

// documentation: https://developers.google.com/recaptcha/docs/verify
const conf = require('../conf.json');
const request = require('request');

export default function *verify (recaptchaResponseCode){
  return new Promise(function(resolve, reject) {
    request({
      url: conf.RECAPTCHA.uri,
      method: 'POST',
      form: {
        secret: conf.RECAPTCHA.secret,
        response: recaptchaResponseCode
      }
    }, function(err, res, body) {
      if(err) return reject(err);
      resolve(body);
    });
  });
}