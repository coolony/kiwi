/*!
 * Coolony's Kiwi
 * Copyright ©2012 Pierre Matri <pierre.matri@coolony.com>
 * MIT Licensed
 */


/**
 * Module dependencies
 */

var utils = require('../utils');


/**
 * Constants
 * @see https://github.com/kof/node-jqtpl
 */

var VERBATIM_RE = /\{\{\s*verbatim\s*\}\}((?:.|\n)*?)\{\{\s*\/\s*verbatim\s*\}\}|{\{\s*raw\s*\}\}((?:.|\n)*?)\{\{\s*\/\s*raw\s*\}\}/g;


/**
 * Global variables
 */

module.exports.tags = {};
var verbatimTag = module.exports.tags.verbatim = {};


/**
 * Basic tag settings
 */

verbatimTag.isBlock = false;


/**
 * Compile `token` with `compiledContents` to JavaScript, and invoke
 * `callback(err, compiled)`.
 *
 * @param {BlockToken} token
 * @param {String} compiledContents
 * @param {Function} callback
 * @api private
 */

verbatimTag.compile = function(token, compiledContents, compiler, callback) {
  var key = parseInt(token.tag.split(' ')[1]);
  callback(null,   '__acc.push("'
                 + utils.escapeCompiledString(compiler.__verbatim[key - 1])
                 + '");');
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

verbatimTag.beforeProcessorPrepend = true;
verbatimTag.beforeProcessor = function(source, compiler, callback) {
  compiler.__verbatim = [];
  source = source.replace(VERBATIM_RE, function onMatch(all, content1, content2) {
    compiler.__verbatim.push(content1 || content2);
    return '{{verbatim ' + compiler.__verbatim.length + '}}';
  });
  callback(null, source);
}
