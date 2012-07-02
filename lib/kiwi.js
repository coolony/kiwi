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

var Template = exports.Template = require('./template');


/**
 * Exports
 */

exports.tools = require('./tools');


// if node
/**
 * Express handler.
 * Render the template located at `filename` with `options`, and invoke
 * `callback(err, rendered)`.
 *
 * @param {String} filename
 * @param {Object} options
 * @param {Function} callback
 * @api public
 */

exports.__express = function(filename, options, callback) {

  var viewOptions = options.settings['view options'] ?
                      _.clone(options.settings['view options']) :
                      {};
  if(options.settings.views) {
    if(!viewOptions.lookupPaths) viewOptions.lookupPaths = [];
    viewOptions.lookupPaths = viewOptions.lookupPaths
                                         .concat(options.settings.views);
  }
  new Template(viewOptions).loadAndRender(filename, options, callback);
}
// end


/**
 * Version
 */

exports.version = '0.1.2';


/**
 * Module exports
 */

module.exports = exports;