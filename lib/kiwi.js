/*!
 * Coolony's Kiwi
 * Copyright ©2012 Pierre Matri <pierre.matri@coolony.com>
 * MIT Licensed
 */


/**
 * Module dependencies
 */

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

  var template = new Template(options.settings['view options'] || {});

  function onLoaded(err, source) {
    if(err) return callback(err);
    template.render(options, callback)
  }

  template.loadFile(filename, onLoaded);
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