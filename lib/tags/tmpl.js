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
 */

var TAG_PARSE_RE = /^tmpl\s+(.*)$/;


/**
 * Global variables
 */

module.exports.tags = {};
var tmplTag = module.exports.tags.tmpl = {};


/**
 * Basic tag settings
 */

tmplTag.isBlock = false;


/**
 * Compile `token` with `compiledContents` to JavaScript, and invoke
 * `callback(err, compiled)`.
 *
 * @param {BlockToken} token
 * @param {String} compiledContents
 * @param {Function} callback
 * @api private
 */

tmplTag.compileTag = function(token, compiledContents, compiler, callback) {
  var parsed = token.tag.match(TAG_PARSE_RE);

  if(!parsed) {
    return callback(new Error(  'Compilation error: Unable to parse tag `'
                              + token.tag
                              + '`.')
                              );
  }

  var nested = parsed[1];

  compiler.__compilationEnd.unshift('});');
  callback(null,   '__template._nest(' + nested + ', __data, '
                 +                    'function(err, rendered){'
                 +   '__acc.push(rendered);'
                 );
}
