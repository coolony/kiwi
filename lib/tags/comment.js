/*!
 * Coolony's Kiwi
 * Copyright ©2012 Pierre Matri <pierre.matri@coolony.com>
 * MIT Licensed
 */


/**
 * Constants
 */

var COMMENT_RE = /\{\{\s*comment\s*\}\}((.|\n)*?)\{\{\s*\/\s*comment\s*\}\}/g;


/**
 * Global variables
 */

module.exports.tags = {};
var commentTag = module.exports.tags['#'] = {};


/**
 * Basic tag settings
 */

commentTag.isBlock = false;


/**
 * Compile `token` with `compiledContents` to JavaScript, and invoke
 * `callback(err, compiled)`.
 *
 * @param {BlockToken} token
 * @param {String} compiledContents
 * @param {Function} callback
 * @api private
 */

commentTag.compile = function(token, compiledContents, compiler, callback) {
  callback(null, '');
}


/**
 * Before Processor.
 * Replace "{{verbatim}}…{{/verbatim}}" with a placeholder in `source`, and
 * invoke `callback(err, replaced)`.
 *
 * @param {String} source
 * @param {Function} callback
 * @api private
 */

commentTag.beforeProcessor = function(source, compiler, callback) {
  source = source.replace(COMMENT_RE, '');
  callback(null, source);
}
