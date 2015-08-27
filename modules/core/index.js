var Promise = require('bluebird');
var config = require('../config');
var rp = require('request-promise');

var core = {
  config: config
};

core.setStorage = function (storage) {
  this.config.setStorage(storage);
};

core.getStorage = function () {
  return this.config.getStorage();
};

/**
 * retrieves the token from the storage
 * @returns {*}
 */
core.getToken = function () {
  return Promise.resolve(this.getStorage().getItem('auth_token')).catch(function () {
    throw {};
  });
};

/**
 * @param token
 * @returns {*}
 */
core.saveToken = function (token) {
  return Promise.resolve(this.getStorage().setItem('auth_token', token)).catch(function () {
    throw {};
  });
};

/**
 * remove the token from the storage
 * @returns {*}
 */
core.removeToken = function () {
  return Promise.resolve(this.getStorage().removeItem('auth_token')).catch(function () {
    throw {};
  });
};

core.addLocaleHeader = function (requestOptions) {
  requestOptions.headers = requestOptions.headers || {};
  requestOptions.headers['Accept-Language'] = this.config.getLocale();
};

core.sendRequest = function (requestOptions) {
  requestOptions = requestOptions || {};
  requestOptions.json = true;
  requestOptions.protocol = this.config.getProtocol() + ':';
  this.addLocaleHeader(requestOptions);
  return rp(requestOptions)
    .then(function (response) {
      return response;
    }).catch(function (e) {
      throw {statusCode: e.statusCode, error: e.error};
    });
};

/**
 * get the token and add the Authorization header to request
 * @param requestOptions
 * @returns {*}
 */
core.sendSignedRequest = function (requestOptions) {
  return this.getToken().then(function (token) {
    requestOptions.headers = requestOptions.headers || {};
    requestOptions.headers['Authorization'] = 'Token ' + token;
    return this.sendRequest(requestOptions);
  }.bind(this));
};

module.exports = core;