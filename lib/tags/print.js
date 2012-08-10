/*!
 * Coolony's Kiwi
 * Copyright ©2012 Pierre Matri <pierre.matri@coolony.com>
 * MIT Licensed
 */


/**
 * Module dependencies
 */

// if node
var _ = require('underscore');
// end

var filter = require('../filter');


/**
 * Constants
 */

var TAG_REPLACE_RE = /\$\{([^\}]*)\}/g;
var TAG_PARSE_RE = /^(?:=|html)\s+(?:\:(\d+)\s+)?([^|]+)(?:\|(.*))?$/;
var FILTER_SPLIT_RE = /\|(?=(?:[^'"]|'[^']*'|"[^"]*")*$)/g;
var FILTER_SPLIT_ARGS_RE = /\,(?=(?:[^'"]|'[^']*'|"[^"]*")*$)/g;
var FILTER_MATCH_RE = /^(\w+)\s*(?:\((.*)\))?$/i;
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
  compiler.__print = [];
  source = source.replace(TAG_REPLACE_RE, function(all, contents) {
    compiler.__print.push(all);
    return '{{= :' + compiler.__print.length + ' ' + contents + '}}';
  });
  callback(null, source);
};


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
  var compiler = function(token, compiledContents, compiler, callback) {
    var parsed = token.tag.match(TAG_PARSE_RE);

    if(!parsed) {
      return callback(new Error('Compilation error: Unable to parse tag `' +
                                token.tag +
                                '`.'
                                ));
    }

    // Handle decompiler
    if(parsed[1]) {
      var key = parseInt(parsed[1], 10) - 1;
      token.__originalTag = compiler.__print[key];
    }

    var contents = parsed[2];
    var filters;
    
    try {
      filters = parsed[3] ? parseFilters(parsed[3], defaultFilters) :
                            defaultFilters;
    } catch(err) {
      return callback(err);
    }
                              
    contents = '$tools.filter(' +
               contents +
               ', ' +
               '[' + filters.join(',') + ']' +
               ')';

    var ret;

    if(!token.options.strict) {
      ret = 'try {' +
              'var __tmp = ' + contents + ';' +
            '} catch(__err) {' +
              'if(__err instanceof ReferenceError) {' +
                '__tmp = "";' +
              '} else {' +
                'throw __err;' +
              '}' +
            '}' +
            '__acc.push(__tmp);';
    } else {
      ret = '__acc.push(' + contents + ');';
    }
    callback(null, ret);
  };

  compiler.untokenize = function(token, compiler) {
    return token.__originalTag ?
             token.__originalTag :
             ('{{' + token.tag + '}}');
  };

  return compiler;
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
  var splittedFilters = filters.split(FILTER_SPLIT_RE);
  
  if(!splittedFilters) {
    throw new Error('Compilation error: Unable to parse filters `' +
                    filters +
                    '`.'
                    );
  }
  
  var parsedFilters = splittedFilters
    .filter(function filterOne(filter) {
      if(filter === 'raw') {
        raw = true;
        return false;
      }
      return true;
    })
    .map(function mapOne(filter) {
      var parsedFilter = filter.match(FILTER_MATCH_RE);
      
      if(!parsedFilter) {
        throw new Error('Compilation error: Unable to parse filter `' +
                        filter +
                        '`.'
                        );
      }
      
      parsedFilter[1] = parsedFilter[1].replace('"', '\"');
      if(!parsedFilter[2]) {
        return '"' + parsedFilter[1] + '"';
      }
      var splittedArgs = parsedFilter[2].split(FILTER_SPLIT_ARGS_RE);
      return '["' + parsedFilter[1] + '", ' +
             splittedArgs.join(',') + ']';
    });

  if(!raw) parsedFilters = parsedFilters.concat(defaults);
  return _.uniq(parsedFilters);
}
