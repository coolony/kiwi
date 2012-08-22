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

var INCLUDE_PARSE_RE = /^include\s+(.+)?$/;
var INCLUDE_ARGS_SPLIT_RE = /\s+(?=(?:[^'"]|'[^']*'|"[^"]*")*$)/g;


/**
 * Global variables
 */

module.exports.tags = {};
var includeTag = module.exports.tags.include = {};
var helpers = module.exports.helpers = {};


/**
 * Basic tag settings
 */

includeTag.isBlock = false;


/**
 * Compile `token` with `compiledContents` to JavaScript, and invoke
 * `callback(err, compiled)`.
 *
 * @param {BlockToken} token
 * @param {String} compiledContents
 * @param {Function} callback
 * @api private
 */

includeTag.compile = function(token, compiledContents, compiler, callback) {
  var parsed = token.tag.match(INCLUDE_PARSE_RE);
  var parsedArgs = parsed ? parsed[1].split(INCLUDE_ARGS_SPLIT_RE) : null;

  if(!parsed || !parsedArgs) {
    return callback(new Error('Compilation error: Unable to parse tag `' +
                              token.tag +
                              '`.'
                              ));
  }

  var name = parsedArgs[0];

  var compiledInclude = parsedArgs[1] ?
                          ('_.extend($data, ' +
                            parsedArgs.splice(1).join(' ') +
                            ')') :
                          '$data';

  compiler.__compilationEnd.unshift('});');
  var compiled = '$helpers.include(' + name + ', $template,' +
                                   compiledInclude + ', ' +
                                   'function(err, rendered) {' +
                   '__acc.push(rendered);';

  callback(null, compiled);
};


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

helpers.include = function(name, template, data, callback) {

  function onRendered(err, rendered) {
    if(err) return callback(err);
    callback(null, rendered);
  }

  template._renderRelative(name, data, null, onRendered);
};
