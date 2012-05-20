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


/**
 * Constants
 */

var ARGS_SPLIT_RE = /\s+(?=(?:[^'"]|'[^']*'|"[^"]*")*$)/g;


/**
 * Helper to create a simple tag called `name` defined by `fn`.
 *
 * @param {String} name
 * @param {Function} fn
 * @api public
 */

module.exports.createSimpleTag = function createSimpleTag(name, fn) {
  token.helpers[name] = fn;
  token.tags[name] = {
    compile: function(token, compiledContents, compiler, callback) {
      var splitted = token.tag.split(ARGS_SPLIT_RE);
      splitted[0] = '__data';
      var args = splitted.join(',');

      var compiled =   '__acc.push(__tools.tools.escapeIfUnsafe('
                     +   '__helpers["' + name + '"](' + args + ')'
                     + '));';

      callback(null, compiled);
    }
  }
}


/**
 * Helper to create a filter called `name` defined by `fn`.
 *
 * @param {String} name
 * @param {Function} fn
 * @api public
 */

module.exports.createFilter = function createFilter(name, fn) {
  filter.filters[name] = fn;
}


/**
 * Escape HTML in `str`.
 *
 * @param {String} str
 * @return {String}
 * @api public
 */

var escape = module.exports.escape = function(str) {
  return str.toString()
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/'/g, "&#146;");
}


/**
 * Mark `str` as safe for use in template.
 *
 * @param {String} str
 * @return {String}
 * @api public
 */

module.exports.safe = function(str) {
  if(!(str instanceof String)) str = new String(str);
  str.safe = true;
  return str;
}


/**
 * Escape HTML in `str` if string is unsafe.
 *
 * @param {String} str
 * @return {String}
 * @api public
 */

module.exports.escapeIfUnsafe = function(str) {
  return str.safe ? str : escape(str);
}
