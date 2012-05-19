/*!
 * Coolony's Kiwi
 * Copyright ©2012 Pierre Matri <pierre.matri@coolony.com>
 * MIT Licensed
 */


/**
 * Module dependencies
 */

var moment = require('moment');


/**
 * Return humanized difference between now and `input`.
 *
 * @param {Mixed} input
 * @return {String}
 * @api private
 */

module.exports.timeago = function(input) {
  return moment(input).fromNow();
}


/**
 * Return calendar time for `input`, relative to now.
 *
 * @param {Mixed} input
 * @return {String}
 * @api private
 */

module.exports.relativedate = function(input) {
  return moment(input).calendar();
}


/**
 * Return formatted `input` with `pattern`.
 *
 * @param {Mixed} input
 * @param {String} pattern
 * @return {String}
 * @api private
 */

module.exports.date = function(input, pattern) {
  return moment(input).format(pattern);
}
