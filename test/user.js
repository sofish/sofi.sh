import * as chai from 'chai';
import * as Helper from './helper';

const assert = chai.assert;
const conf = require('../conf');

describe('user.js: CRUD', function() {
  const TEST_USER = '_TEST_USER_';

  var user;
  var data = {
    name: TEST_USER,
    password: '1'
  };

  before(function(done) {
    Helper.send('POST', '/user', data).then(function(res) {
      user = res;
      done();
    }).catch(done);
  });

  it(`[R] contains \`name\`, and should be ${TEST_USER}`, function() {
    assert.equal(user.name, TEST_USER);
  });

  it('[R] should not contain `password`', function() {
    assert.typeOf(user.password, 'undefined');
  });

  it('[R] by default, `role` is 1(reader)', function() {
    assert.equal(user.role, 1);
  });

  it('[C] duplicate user', function(done) {
    Helper.send('POST', '/user', data).then(function(res) {
      assert.equal(res.error, 'you can\'t use the name: `_TEST_USER_`');
      done()
    }).catch(done);
  });

  it('[R] users list should return an array', function(done) {
    Helper.send('GET', `/user`).then(function(res) {
      assert.typeOf(res, 'array');
      done();
    }).catch(done);
  });

  it('[R] a single user should an object', function(done) {
    Helper.send('GET', `/user/${user.name}`).then(function(res) {
      assert.equal(res.name, TEST_USER);
      done();
    }).catch(done);
  });

  it('[U] `role` should be a number', function(done) {
    Helper.send('PATCH', `/user/${user.name}`, {role: "1"}).then(function(res) {
      assert.equal(res.error, '`role` should be a(n) Number');
      done();
    }).catch(done);
  });

  it('[U] `password` should be a string', function(done) {
    Helper.send('PATCH', `/user/${user.name}`, {password: 1}).then(function(res) {
      assert.equal(res.error, '`password` should be a(n) String');
      done();
    }).catch(done);
  });

  it('[D] delete a user', function(done) {
    Helper.send('DELETE', `/user/${user.name}`).then(function(res) {
      assert.equal(res.success, 1);
      done();
    }).catch(done);
  });

  it('[C] `name` is required', function(done) {
    Helper.send('POST', '/user', {}).then(function(res) {
      assert.equal(res.error, '`name` is required');
      done();
    }).catch(done);
  });

  it('[C] `password` is required', function(done) {
    Helper.send('POST', '/user', {name: TEST_USER}).then(function(res) {
      assert.equal(res.error, '`password` is required');
      done();
    }).catch(done);
  });
});