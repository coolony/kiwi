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

var EXTEND_PARSE_RE = /^extend\s+(.+)$/;


/**
 * Global variables
 */

module.exports.tags = {};
var extendTag = module.exports.tags.extend = {};
var helpers = module.exports.helpers = {};


/**
 * Basic tag settings
 */

extendTag.isBlock = false;


/**
 * Compile `token` with `compiledContents` to JavaScript, and invoke
 * `callback(err, compiled)`.
 *
 * @param {BlockToken} token
 * @param {String} compiledContents
 * @param {Function} callback
 * @api private
 */

extendTag.compileTag = function(token, compiledContents, compiler, callback) {
  if(token.root.children[0] !== token) {
    return callback(new Error(  'Compilation error: Extend tag must be defined '
                              + 'at the very beginning of the template.')
                              );
  }

  var parsed = token.tag.match(EXTEND_PARSE_RE);

  if(!parsed) {
    return callback(new Error(  'Compilation error: Unable to parse tag `'
                              + token.tag
                              + '`.')
                              );
  }

  var name = parsed[1];

  var compiled =   'var __originalCallback = __callback;'
                 + '__callback = function(err, compiled) {'
                 +   '__helpers.extend(' + name + ', __compiled, __template,'
                 +                    '__data, __originalCallback);'
                 + '};';

  callback(null, compiled);
}


/**
 * Helper function.
 * Make `compiled` `template` with `data` extend `name` template, and invoke
 * `callback(err, compiled)`.
 *
 * @param {String} name
 * @param {String} compiled
 * @param {Template} template
 * @param {Object} data
 * @param {Function} callback
 * @api private
 */

helpers.extend = function(name, compiled, template, data, callback) {

  function onRendered(err, rendered) {
    if(err) return callback(err);
    callback(null, rendered);
  }

  template._renderRelative(name, data, compiled, onRendered);
}
