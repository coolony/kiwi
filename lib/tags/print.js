/*!
 * Coolony's Kiwi
 * Copyright ©2012 Pierre Matri <pierre.matri@coolony.com>
 * MIT Licensed
 */


/**
 * Module dependencies
 */

var _ = require('underscore');

var filter = require('../filter');


/**
 * Constants
 */

var TAG_REPLACE_RE = /\$\{([^\}]*)\}/g;
var TAG_PARSE_RE = /^(?:=|html)\s+([^|]+)(?:\|(.*))?$/;
var FILTER_SPLIT_RE = /\|(?=(?:[^'"]|'[^']*'|"[^"]*")*$)/g;
var FILTER_SPLIT_ARGS_RE = /\,(?=(?:[^'"]|'[^']*'|"[^"]*")*$)/g;
var FILTER_MATCH_RE = /^([a-z]+)\s*(?:\((.*)\))?$/i;
var DEFAULT_VARIABLE_FILTERS = ['escapeIfUnsafe'].map(JSON.stringify);
var DEFAULT_HTML_FILTERS = [];


/**
 * Global variables
 */

module.exports.tags = {};
var variableTag = module.exports.tags['='] = {};
var htmlTag = module.exports.tags['html'] = {};


/**
 * Basic tag settings
 */

variableTag.isBlock = false;
htmlTag.isBlock = false;


/**
 * Before Processor.
 * Replace "${…}" to "{{= …}}" in `source`, and invoke
 * `callback(err, replaced)`.
 *
 * @param {String} source
 * @param {Function} callback
 * @api private
 */

variableTag.beforeProcessor = function(source, compiler, callback) {
  source = source.replace(TAG_REPLACE_RE, '{{= $1}}');
  callback(null, source);
}


/**
 * Compilers.
 */

variableTag.compile = createPrintTagCompiler(DEFAULT_VARIABLE_FILTERS);
htmlTag.compile = createPrintTagCompiler(DEFAULT_HTML_FILTERS);


/**
 * Create print tag based on `defaultFilters`.
 * Return `function(token, compiledContents, compiler, callback)`.
 *
 * @param {Array} defaultFilters
 * @return {Function}
 * @api private
 */

function createPrintTagCompiler(defaultFilters) {
  return function(token, compiledContents, compiler, callback) {
    var parsed = token.tag.match(TAG_PARSE_RE);

    if(!parsed) {
      return callback(new Error(  'Compilation error: Unable to parse tag `'
                                + token.tag
                                + '`.')
                                );
    }

    var contents = parsed[1];
    var filters = parsed[2] ? parseFilters(parsed[2], defaultFilters) :
                              defaultFilters;
    var contents =   '__tools.filter('
                   + contents
                   + ', '
                   + '[' + filters.join(',') + ']'
                   + ')';
    var ret;

    if(!token.options.strict) {
      ret =   'try {'
            +   'var __tmp = ' + contents + ';'
            + '} catch(__err) {'
            +   'if(__err instanceof ReferenceError) {'
            +     '__tmp = "";'
            +   '} else {'
            +     'throw __err;'
            +   '}'
            + '}'
            + '__acc.push(__tmp);';
    } else {
      ret = '__acc.push(' + contents + ');';
    }
    callback(null, ret);
  }
}


/**
 * Parse `filters` with `defaults`, and return the parsed string to include
 * in compiled template.
 *
 * @param {String} filters
 * @param {Mixed[]} defaults
 * @return {String}
 * @api private
 */

function parseFilters(filters, defaults) {
  var raw = false;
  filters = filters.split(FILTER_SPLIT_RE)
                   .filter(function filterOne(filter) {
                     if(filter == 'raw') {
                       raw = true;
                       return false;
                     }
                     return true;
                   })
                   .map(function mapOne(filter) {
                     filter = filter.match(FILTER_MATCH_RE);
                     filter[1] = filter[1].replace('"', '\"');
                     if(!filter[2]) {
                       return '"' + filter[1] + '"';
                     }
                     var splittedArgs = filter[2].split(FILTER_SPLIT_ARGS_RE);
                     return '["' + filter[1] + '", ' + splittedArgs.join(',') + ']';
                   });

  if(!raw) filters = filters.concat(defaults);
  return _.uniq(filters);
}
