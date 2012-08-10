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

var FILTER_PARSE_RE = /^filter\s+(.+)$/;


/**
 * Global variables
 */

module.exports.tags = {};
var filterTag = module.exports.tags.filter = {};


/**
 * Basic tag settings
 */

filterTag.isBlock = true;


/**
 * Compile `token` with `compiledContents` to JavaScript, and invoke
 * `callback(err, compiled)`.
 *
 * @param {BlockToken} token
 * @param {String} compiledContents
 * @param {Function} callback
 * @api private
 */

filterTag.compile = function(token, compiledContents,
                             compiledIntermediate, compiler, callback) {

  var parsed = token.tag.match(FILTER_PARSE_RE);

  if(!parsed) {
    return callback(new Error('Compilation error: Unable to parse tag `' +
                              token.tag +
                              '`.'
                              ));
  }
  
  var filters;
  
  try {
    filters = utils.parseFilters(parsed[1]);
  } catch(err) {
    return callback(err);
  }

  var name = parsed[1];

  var compiled = '(function(__parentAcc) {' +
                   'var __acc = [];' +
                   compiledContents +
                   '__parentAcc.push(' +
                     '$tools.filter(' +
                       '__acc.join(""),' +
                       '[' + filters.join(',') + ']' +
                     ')' +
                   ');' +
                 '})(__acc);';

  callback(null, compiled);
};
