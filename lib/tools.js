/*!
 * Coolony's Kiwi
 * Copyright ©2012 Pierre Matri <pierre.matri@coolony.com>
 * MIT Licensed
 */


/**
 * Module dependencies
 */

var token = require('./token');
var filter = require('./filter');
var utils = require('./utils');


/**
 * Constants
 */

var ARGS_SPLIT_RE = /\s+(?=(?:[^'"]|'[^']*'|"[^"]*")*$)/g;
var FILTER_NAME_RE = /^\w+$/;
var TAG_NAME_RE = FILTER_NAME_RE;


/**
 * Helper to create a simple tag called `name` defined by `fn`.
 *
 * @param {String} name
 * @param {Function} fn
 * @api public
 */

exports.createSimpleTag = function createSimpleTag(name, fn) {

  // Check name
  if(!name.match(TAG_NAME_RE)) {
    throw new Error('Error:`' + name + '` is not a valid tag name.');
  }

  token.helpers[name] = fn;
  token.tags[name] = {
    compile: function(token, compiledContents, compiler, callback) {
      var splitted = token.tag.split(ARGS_SPLIT_RE);
      splitted[0] = '$data';
      var args = splitted.join(',');

      var compiled = '__acc.push($tools.tools.escapeIfUnsafe(' +
                       '$helpers["' + name + '"](' + args + ')' +
                     '));';

      callback(null, compiled);
    }
  };
};


/**
 * Helper to create a filter called `name` defined by `fn`.
 *
 * @param {String} name
 * @param {Function} fn
 * @api public
 */

exports.createFilter = function createFilter(name, fn) {

  // Check name
  if(!name.match(FILTER_NAME_RE)) {
    throw new Error('Error:`' + name + '` is not a valid filter name.');
  }

  filter.filters[name] = fn;
};


/**
 * Escape HTML in `str`.
 *
 * @param {String} str
 * @return {String}
 * @api public
 */

var escape = exports.escape = function(str) {
  return str.toString()
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/'/g, "&#146;");
};


/**
 * Export SafeString.
 */

var SafeString = exports.SafeString = String;


/**
 * Mark `str` as safe for use in template.
 *
 * @param {String} str
 * @return {String}
 * @api public
 */

exports.safe = function(str) {
  if(!(str instanceof SafeString)) str = new SafeString(str);
  return str;
};


/**
 * Escape HTML in `str` if string is unsafe.
 *
 * @param {String} str
 * @return {String}
 * @api public
 */

exports.escapeIfUnsafe = function(str) {
  return str instanceof SafeString ? str : escape(str);
};


/**
 * Expose` applyAll`, `escapeCompiledString`, `registerTag` and
 * `registerHelper`.
 */

exports.registerTag = token.registerTag;
exports.registerHelper = token.registerHelpers;
exports.escapeCompiledString = utils.escapeCompiledString;
exports.applyAll = utils.applyAll;
exports.safeString = String;


/**
 * Module exports
 */

module.exports = exports;