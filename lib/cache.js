/*!
 * Coolony's Kiwi
 * Copyright ©2012 Pierre Matri <pierre.matri@coolony.com>
 * MIT Licensed
 */


/**
 * Module dependencies.
 */

// if node
var _ = require('underscore');
// end


/**
 * Basic cache for client mode.
 *
 * Constructor.
 *
 * @api public
 */

function Cache() {
  this._cache = {};
}


/**
 * Set `key` to `value`.
 *
 * @param {String} key
 * @param {Mixed} value
 * @api public
 */

Cache.prototype.cache = function(key, value) {
  if(_.isUndefined(value)) return;
  this._cache[key] = value;
};


/**
 * Get `key`.
 *
 * @param {String} key
 * @return {Mixed}
 * @api public
 */

Cache.prototype.get = function(key) {
  return this._cache[key];
};


/**
 * Module exports.
 */

module.exports = Cache;