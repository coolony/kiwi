/*!
 * Coolony's Kiwi
 * Copyright ©2012 Pierre Matri <pierre.matri@coolony.com>
 * MIT Licensed
 */


/**
 * Module dependencies
 */

// if browser
//var Cache = require('./cache');
//var CappedCache = Cache;
// end
// if node
var path = require('path');
var frame = require('frame');
var Cache = frame.Cache;
var CappedCache = frame.CappedCache;
var construct = frame.classes.construct;
var _ = require('underscore');
// end

var utils = require('./utils');
var token = require('./token');
var tools = require('./tools');
var Compiler = require('./compiler');
var filter = require('./filter');


/**
 * Constants
 */

var DEFAULTS = {
  lookup: utils.lookupTemplate,
  load: utils.loadTemplate,
  path: null,
  cache: true,
  cacheHandler: Cache,
  cacheOptions: [],
  lookupPaths: [],
  cacheTmplHandler: CappedCache,
  cacheTmplOptions: [1000],
  useIsolatedTmplCache: true,
  cacheContext: null,
  strict: true,
  eachCounters: true,
  _parent: null,
  _cacheAttachment: '_cache',
  _cacheTmplAttachment: '_nestCache'
};
var TEMPLATE_EXPORTS = {filter: filter, utils: utils, tools: tools};


/**
 * Initializes `Template` with optionnally the given `str` and
 * `options`.
 *
 * @param {String} [str]
 * @param {Object} [options]
 * @api public
 */

function Template(str, options) {

  // Handle the case where the only argument passed is the `options` object
  if(_.isObject(str) && !options){
    options = str;
    str = null;
  }

  // Create options if not provided
  options = options ? _.clone(options) : {};

  // Set default cache behavior
  // if node
  if(!_.isBoolean(options.cache)) {
    options.cache = process.env.NODE_ENV === 'production';
  }
  // end

  // Merges given `options` with `DEFAULTS`
  options = _.defaults(options, DEFAULTS);
  options.cacheContext = options.cacheContext || Template;

  // Sets instance variables
  this.template = str;
  this.options = options;
  this._compiled = null;

  // Creates the cache if not already done
  if(options.cache && !(this._getCache() instanceof options.cacheHandler)) {
    var cacheOptions = [options.cacheHandler].concat(options.cacheOptions);
    options.cacheContext[options._cacheProp] = typeof window !== 'undefined' ?
                                                 new options.cacheHandler() :
                                                 construct.apply(this,
                                                                 cacheOptions);
  }
}


/**
 * Get cache handler
 *
 * @return {Object}
 * @api private
 */

Template.prototype._getCache = function() {
  return this.options.cacheContext[this.options._cacheProp];
};


/**
 * Load the template from disk at `filePath`, and invoke `callback(err)`.
 *
 * @param {String} filePath
 * @param {Function} callback
 * @api public
 */

Template.prototype.loadFile = function(filePath, callback) {
//if node
  var _this = this;
  this.options.load(filePath, function onLoad(err, data) {
    if(err) return callback(err);
    _this.options.path = path.normalize(filePath);
    _this.template = data;
    callback();
  });
// end
// if browser
// callback(new Error('Client mode does not support reading from file.'));
// end
};


/**
 * Render the template with given `data`, and invoke `callback(err, compiled)`.
 *
 * @param {Object} [data]
 * @param {Function} callback
 * @api public
 */

Template.prototype.render = function(data, callback) {

  // Support callback as 1st arg
  if(_.isFunction(data) && !callback){
    callback = data;
    data = null;
  }

  // Data defaults and / or cloning
  data = data ? _.clone(data) : data;

  // Check whether we have the compiled template ready in the object or in cache
  var cacheKey = 'template::' + this._cacheKey();
  if(!this.compiled && this.options.cache) {
    this._compiled = this._getCache().get(cacheKey);
  }

  // Render it if we got it…
  if(this._compiled) return this._renderCompiled(data, callback);

  // …or compile it if we don't
  var _this = this;
  this._compile(function(err){
    if(err) return callback(err);
    _this._renderCompiled(data, callback);
  });
};


/**
 * Load the template from disk at `filePath`, render it with given `data`,
 * and invoke `callback(err, compiled)`.
 *
 * @param {String} filePath
 * @param {Object} [data]
 * @param {Function} callback
 * @api public
 */

Template.prototype.loadAndRender = function(filePath, data, callback) {
// if node
  var _this = this;

  // Support callback as 2nd arg
  if(_.isFunction(data) && !callback){
    callback = data;
    data = {};
  }

  this.loadFile(filePath, function onLoaded(err) {
    if(err) return callback(err);
    _this.render(data, callback);
  });
// end
// if browser
// callback(new Error('Client mode does not support reading from file.'));
// end
};


/**
 * Render the compiled template with given `data`, and invoke
 * `callback(err, compiled)`.
 *
 * @param {String} filePath
 * @param {Function} callback
 * @api private
 */

Template.prototype._renderCompiled = function onRendered(data, callback) {
  try {
    // Apply compiled function to itself (needed for function helpers)
    this._compiled.call(this._compiled, this, TEMPLATE_EXPORTS, _, data,
                        token.helpers, callback);
  } catch(err) {
    callback(err);
  }
};


/**
 * Compile the template, and invoke `callback(err, compiled)`.
 *
 * @param {Function} callback
 * @api private
 */

Template.prototype._compile = function(callback) {
  var _this = this;
  if(!_.isString(this.template)) {
    return callback(new Error('Template contents not set'));
  }

  new Compiler(this).compile(function(err, compiled) {

    if(err) return callback(err);

    // Save the compiled template in this object
    _this._compiled = compiled;

    // Cache it, if possible
    var cacheKey = 'template::' + _this._cacheKey();
    if(_this.options.cache) {
      _this._getCache().cache(cacheKey, compiled);
    }

    // Invoke the callback
    callback(null, compiled);
  });
};


/**
 * Render `nested` template with `data`, and invoke `callback(err, rendered)`.
 *
 * @param {String} nested
 * @param {Object} data
 * @param {Function} callback
 * @api private
 */

Template.prototype._nest = function(nested, data, callback) {
  var options = _.clone(this.options);
  if(options.useIsolatedTmplCache) {
    options._cacheAttachment = options._cacheTmplAttachment;
    options.cacheHandler = options.cacheTmplHandler;
    options.cacheOptions = options.cacheTmplOptions;
  }
  new Template(nested, options).render(data, function onDone(err, rendered) {
    if(err) return callback(err);
    callback(null, rendered);
  });
};


/**
 * Render `nested` template with `data`, and invoke `callback(err, rendered)`.
 *
 * @param {String} nested
 * @param {Object} data
 * @param {Function} callback
 * @api private
 */

Template.prototype._renderRelative = function(name, data, rendered, callback) {
  var _this = this;
  var cacheKey;
  var cachedPath;
  var template;

  function onTemplateLocated(err, filePath) {
    if(err) return callback(err);
    if(_this.options.cache) {
      _this._getCache().cache(cacheKey, filePath);
    }
    template.loadFile(filePath, onTemplateLoaded);
  }

  function onTemplateLoaded(err, source) {
    if(err) return callback(err);
    template.render(data, onTemplateRendered);
  }

  function onTemplateRendered(err, result) {
    if(err) return callback(err);
    callback(null, result);
  }

  if(name instanceof Template) {

    template = name;
    template.options._parent = rendered;
    template.render(data, onTemplateRendered);

  } else {

    var options = _.clone(this.options);
    options._parent = rendered;
    template = new Template(options);
    cacheKey = 'path::' + this._cacheKey() + '::' + name;

    // Handle cache
    if(this.options.cache) {
      cachedPath = this._getCache().get(cacheKey);
    }
    if(cachedPath) {
      template.loadFile(cachedPath, onTemplateLoaded);
    } else {
      this.options.lookup(name, this, onTemplateLocated);
    }
  }
};


/**
 * Calculate  and return cache key.
 *
 * @return {String} Cache key.
 * @api private
 */

Template.prototype._cacheKey = function() {
  return this.options.path || this.template || null;
};


/**
 * Module exports
 */

module.exports = Template;
