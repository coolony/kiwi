/*!
 * Coolony's Kiwi
 * Copyright ©2012 Pierre Matri <pierre.matri@coolony.com>
 * MIT Licensed
 */


/*
 * Module dependencies
 */

var frame = require('frame');
var _ = require('underscore');


/*
 * Apply `filters` to `input`, and return output.
 *
 * @param {String} input
 * @param {Mixed[]} filters
 * @return {String}
 * @api private
 */

function filter(input, filters) {
  var unknownFilter;
  filters.forEach(function(filterName) {
    var filterArgs = [];
    if(_.isArray(filterName)) {
      filterArgs = filterName.slice(1);
      filterName = filterName[0];
    }
    var filterFunction = module.exports.filters[filterName];
    if(!filterFunction) {
      unknownFilter = filterName;
      return false;
    }
    input = filterFunction.apply(this, [input].concat(filterArgs));
  });
  if(unknownFilter) {
    throw new Error(  'Rendering error: Unknown filter `'
                    + unknownFilter
                    + '`.');
  }
  return input;
}


/*
 * Module exports
 */

module.exports = filter;
var filters = module.exports.filters = {};


/*
 * Read tags from tags directory
 */

(function loadFilters() {
  var loadedFiles = frame.files.requireDir(__dirname + '/filters/');
  for(file in loadedFiles) {
    var fileFilters = loadedFiles[file];
    for(filter in fileFilters) {
      filters[filter] = fileFilters[filter];
    }
  }
})();
