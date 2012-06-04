/*!
 * Coolony's Kiwi
 * Copyright ©2012 Pierre Matri <pierre.matri@coolony.com>
 * MIT Licensed
 */

/**
 * Module dependencies
 */

// if browser
var frame;
// end
// if node
var fs = require('fs');
var path = require('path');
var frame = require('frame');
// end


/**
 * Constants
 */

var DEFAULT_FILE_EXTENSION = '.kiwi';


// if node
/**
 * Load `filePath`, and invoke `callback(err, data)`.
 *
 * @param {String} filePath
 * @param {Function} callback
 * @api private
 */

exports.loadTemplate = function(filePath, callback) {
  fs.readFile(filePath, 'utf-8', function onLoad(err, data) {
    if(err) return callback(err);
    callback(null, data);
  })
}


/**
 * Lookup `template` relative to `parentTemplate`, and invoke
 * `callback(err, filePath)`.
 *
 * @param {String} template
 * @param {Template} parentTemplate
 * @param (Function} callback
 * @api private
 */

exports.lookupTemplate = function(name, parentTemplate, callback) {
  var ext = path.extname(name);
  var parentPath = parentTemplate.options.path;
  var parentDir = parentPath ? path.dirname(parentPath) : null;
  var lookupPaths = parentTemplate.options.lookupPaths || [];

  function doTry(tryPath, next) {
    path.exists(tryPath, function(exists) {
      if(exists) return callback(null, tryPath);
      next();
    });
  }

  var tryPaths = [];
  if(name[0] === '/') tryPaths.push(name);
  lookupPaths.concat(parentDir).forEach(function(lookupPath) {
    tryPaths.push(path.join(lookupPath, name));
    tryPaths.push(path.join(lookupPath, name + DEFAULT_FILE_EXTENSION));
  });

  frame.asyncForEach(tryPaths, doTry, function onDone() {
    callback(new Error(  'RenderError: Can\'t locate template '
                       + '`' + name + '`.'
                       ));
  })

  /*function tryWithoutExtension() {
    path.exists(name, function(exists) {
      if(!exists) return tryWithExtension();
      callback(null, name);
    });
  }

  function tryWithExtension() {
    var ext = path.extname(name);
    if(ext.length && ext === DEFAULT_FILE_EXTENSION) {
      callback(new Error(  'RenderError: Can\'t locate template '
                         + '`' + name + '`.'
                         ));
    }
    name = name + DEFAULT_FILE_EXTENSION;
    path.exists(name, function(exists) {
      if(!exists) {
        return callback(new Error(  'RenderError: Can\'t locate template '
                                  + '`' + name + '`.'
                                  ));
      }
      callback(null, name);
    })
  }*/
}
// end


/**
 * Asynchronous ForEach implementation.
 * Iterates over `array`, invoking `fn(item, args…, next)` for each item, and
 * invoke `callback(err)` when done.
 *
 * @see http://zef.me/3420/async-foreach-in-javascript
 * @param {Array} array
 * @param {Function} fn
 * @param {Mixed[]} [args]
 * @param {Function} callback
 * @api puclic
 */


function tmpAsyncForEach(array, fn, args, callback) {

  if(typeof args === 'function' && !callback) {
    callback = args;
    args = null;
  }

  if(!args) args = [];
  array = array.slice(0);

  function handleProcessedCallback(err) {
    if(err) return callback(err);
    if(array.length > 0) {
      setTimeout(processOne, 0);
    } else {
      callback();
    }
  }

  function processOne() {
    var item = array.shift();
    fn.apply(this, [item].concat(args).concat([handleProcessedCallback]));
  }
  if(array.length > 0) {
    setTimeout(processOne, 0);
  } else {
    callback();
  }
};
var asyncForEach = frame ? frame.asyncForEach : tmpAsyncForEach;


/**
 * Asynchronously apply `processor` to `input`, and invoke
 * `callback(err, result)`.
 *
 * @param {Mixed} input
 * @param {Function} processor
 * @param {Function} callback
 * @api private
 */

var apply = exports.apply = function(input, processor, args, callback) {

  if(typeof args === 'function' && !callback) {
    callback = args;
    args = null;
  }

  function done(err, result) {
    if(err) return callback(err);
    callback(null, result);
  }

  processor.apply(this, [input].concat(args || []).concat([done]));
}


/**
 * Asynchronously apply `processors` to `input` with `args`, and invoke
 * `callback(err, result)`.
 *
 * @param {Mixed} input
 * @param {Function[]} processors
 * @param {Mixed[]} [args]
 * @param {Function} callback
 * @api private
 */

exports.applyAll = function(input, processors, args, callback) {

  function applyOne(processor, next) {
    apply(input, processor, args || [], function onApplied(err, result) {
      if(err) return next(err);
      input = result;
      next();
    });
  }

  function done(err) {
    if(err) return callback(err);
    callback(null, input);
  }

  if(typeof args === 'function' && !callback) {
    callback = args;
    args = null;
  }
  asyncForEach(processors, applyOne, done);
}

/**
 * Asynchronously compiles `tokens`, and invoke
 * `callback(err, compiled)` with `compiled` as an array.
 *
 * @param {BaseToken[]} tokens
 * @param {Function} callback
 * @api private
 */

function compileTokenArray(tokens, compiler, callback) {
  var acc = [];
  var index = 0;

  function compileOne(token, next) {
    token.compile(compiler, function onCompiled(err, compiled) {
      if(err) return next(err);
      acc.push(compiled);
      next(null, compiled);
    });
    index++;
  }

  function done(err) {
    if(err) return callback(err);
    callback(null, acc);
  }

  asyncForEach(tokens, compileOne, done);
}
exports.compileTokenArray = compileTokenArray;


/**
 * Asynchronously compiles `tokens`, glue them, and invoke
 * `callback(err, compiled)`.
 *
 * @param {BaseToken[]} tokens
 * @param {Function} callback
 * @api private
 */

exports.compileTokens = function(tokens, compiler, callback) {
  compileTokenArray(tokens, compiler, function(err, compiled) {
    if(err) return callback(err);
    callback(null, compiled.join(''));
  })
}


/**
 * Escape `str` for use in template compilation.
 *
 * @param {String} str
 * @return {String} Escaped `str`.
 * @api private
 */

exports.escapeCompiledString = function(str) {
  return str.replace(/([\\"])/g, '\\$1')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t');
}


/**
 * Return `true` if `input` is iterable and not a string.
 *
 * @param {Mixed} input
 * @return {Boolean}
 * @api private
 */

exports.isIterable = function(input) {
  return typeof input === 'object' && !(input instanceof String)
}


/**
 * Simple class inheritance.
 * Make `subclass` inherit from `superclass.
 *
 * based on http://peter.michaux.ca/articles/class-based-inheritance-in-javascript
 * @param {Object} subclass
 * @param {Object} superclass
 * @api public
 */

exports.extend = function(subclass, superclass) {
  function Dummy(){}
  Dummy.prototype = superclass.prototype;
  subclass.prototype = new Dummy();
  subclass.prototype.constructor = subclass;
  subclass._superclass = superclass;
  subclass._superproto = superclass.prototype;
}


/**
 * Module exports
 */

module.exports = exports;