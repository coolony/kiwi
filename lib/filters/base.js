/*!
 * Coolony's Kiwi
 * Copyright ©2012 Pierre Matri <pierre.matri@coolony.com>
 * MIT Licensed
 *
 * Partly based on Swig
 * @see https://github.com/paularmstrong/swig
 */


/**
 * Module dependencies
 */

var _ = require('underscore');
var tools = require('../tools');
var utils = require('../utils');


/**
 * Escape HTML in `input`.
 *
 * @param {String} input
 * @return {String}
 * @api private
 */

module.exports.escape = function(input) {
  if(input === null || input === undefined) return '';
  if(utils.isIterable(input)) {
    var acc = {};
    _.each(input, function (value, key) {
      acc[key] = module.exports.escape(value);
    });
    return acc;
  }
  return tools.escape(input);
}


/**
 * Escape HTML in `input` if not marked as safe.
 *
 * @param {String} input
 * @return {String}
 * @api private
 */

module.exports.escapeIfUnsafe = function(input) {
  if(input === null || input === undefined) return '';
   if(utils.isIterable(input)) {
    var acc = {};
    _.each(input, function (value, key) {
      acc[key] = module.exports.escapeIfUnsafe(value);
    });
    return acc;
  }
  return tools.escapeIfUnsafe(input);
}


/**
 * Capitalize `input`.
 *
 * @param {Mixed} input
 * @return {String}
 * @api private
 */

module.exports.capitalize = function(input) {
   if(utils.isIterable(input)) {
    var acc = {};
    _.each(input, function (value, key) {
      acc[key] = module.exports.capitalize(value);
    });
    return acc;
  }
  input = input.toString();
  return input.charAt(0).toUpperCase() + input.slice(1);
}


/**
 * Make `input` uppercase.
 *
 * @param {String} input
 * @return {String}
 * @api private
 */

module.exports.upper = function(input) {
   if(utils.isIterable(input)) {
    var acc = {};
    _.each(input, function (value, key) {
      acc[key] = module.exports.upper(value);
    });
    return acc;
  }
  return input.toString().toUpperCase();
}


/**
 * Make `input` lowercase.
 *
 * @param {String} input
 * @return {String}
 * @api private
 */

module.exports.lower = function(input) {
   if(utils.isIterable(input)) {
    var acc = {};
    _.each(input, function (value, key) {
      acc[key] = module.exports.lower(value);
    });
    return acc;
  }
  return input.toString().toLowerCase();
}


/**
 * Transform `input` to JSON.
 *
 * @param {Mixed} input
 * @return {Mixed}
 * @api private
 */

module.exports.json = function(input) {
  return JSON.stringify(input);
}


/**
 * Add `operand` to `input` and return the result.
 *
 * @param {Mixed} input
 * @param {Mixed} operand
 * @return {Mixed}
 * @api private
 */

module.exports.add = function(input, operand) {
  if(typeof input === 'object') {
    var acc = {};
    _.each(input, function (value, key) {
      acc[key] = module.exports.add(value, operand);
    });
    return acc;
  }
  return parseFloat(input) + parseFloat(operand);
}


/**
 * Subtract `operand` from `input` and return the result.
 *
 * @param {Mixed} input
 * @param {Mixed} operand
 * @return {Mixed}
 * @api private
 */

module.exports.subtract = function(input, operand) {
  return module.exports.add(input, -parseInt(operand));
}


/**
 * Multiply `operand` by `input` and return the result.
 *
 * @param {Mixed} input
 * @param {Mixed} operand
 * @return {Mixed}
 * @api private
 */

module.exports.mul = function(input, operand) {
  if(typeof input === 'object') {
    var acc = {};
    _.each(input, function (value, key) {
      acc[key] = module.exports.mul(value, operand);
    });
    return acc;
  }
  return parseFloat(input) * parseFloat(operand);
}


/**
 * Divide `input` by `operand` and return the result.
 *
 * @param {Mixed} input
 * @param {Mixed} operand
 * @return {Mixed}
 * @api private
 */

module.exports.div = function(input, operand) {
  if(typeof input === 'object') {
    var acc = {};
    _.each(input, function (value, key) {
      acc[key] = module.exports.div(value, operand);
    });
    return acc;
  }
  return parseFloat(input) / parseFloat(operand);
}


/**
 * Add 1 to `input` and return the result.
 *
 * @param {Mixed} input
 * @return {Mixed}
 * @api private
 */

module.exports.incr = function(input, operand) {
  return module.exports.add(input, 1);
}


/**
 * Subtract 1 from `input` and return the result.
 *
 * @param {Mixed} input
 * @return {Mixed}
 * @api private
 */

module.exports.decr = function(input, operand) {
  return module.exports.add(input, -1);
}


/**
 * Round `input` and return the result.
 *
 * @param {Mixed} input
 * @return {Mixed}
 * @api private
 */

module.exports.round = function(input) {
  if(typeof input === 'object') {
    var acc = {};
    _.each(input, function (value, key) {
      acc[key] = module.exports.round(value, operand);
    });
    return acc;
  }
  return Math.round(input);
}


/**
 * Calculate floor of `input` and return the result.
 *
 * @param {Mixed} input
 * @return {Mixed}
 * @api private
 */

module.exports.floor = function(input) {
  if(typeof input === 'object') {
    var acc = {};
    _.each(input, function (value, key) {
      acc[key] = module.exports.floor(value, operand);
    });
    return acc;
  }
  return Math.floor(input);
}


/**
 * Calculate ceiling of `input` and return the result.
 *
 * @param {Mixed} input
 * @return {Mixed}
 * @api private
 */

module.exports.ceil = function(input) {
  if(typeof input === 'object') {
    var acc = {};
    _.each(input, function (value, key) {
      acc[key] = module.exports.ceil(value, operand);
    });
    return acc;
  }
  return Math.ceil(input);
}


/**
 * Remove all occurences of `needle` in `input`.
 *
 * @param {String} input
 * @param {String} needle
 * @return {String}
 * @api private
 */

module.exports.cut = function(input, needle) {
  if(typeof input === 'object') {
    var acc = {};
    _.each(input, function (value, key) {
      acc[key] = module.exports.cut(value, needle);
    });
    return acc;
  }
  return input.toString().replace(needle, '')
}


/**
 * Slash `input`.
 *
 * @param {Mixed} input
 * @return {Mixed}
 * @api private
 */

module.exports.addslashes = function(input) {
   if(utils.isIterable(input)) {
    var acc = {};
    _.each(input, function (value, key) {
      acc[key] = module.exports.capitalize(value);
    });
    return acc;
  }
  return input.toString()
              .replace(/\\/g, '\\\\')
              .replace(/\'/g, "\\'")
              .replace(/\"/g, '\\"')
              .replace(/\0/g,'\\0');
}


/**
 * Unslash `input`.
 *
 * @param {Mixed} input
 * @return {Mixed}
 * @api private
 */

module.exports.stripslashes = function(input) {
   if(utils.isIterable(input)) {
    var acc = {};
    _.each(input, function (value, key) {
      acc[key] = module.exports.capitalize(value);
    });
    return acc;
  }
  return input.toString()
              .replace(/\\'/g,'\'')
              .replace(/\\"/g,'"')
              .replace(/\\0/g,'\0')
              .replace(/\\\\/g,'\\');
}


/**
 * Return first element from `input`.
 *
 * @param {Mixed} input
 * @return {Mixed}
 * @api private
 */

module.exports.first = function (input) {
  if(typeof input === 'object' && !_.isArray(input)) return '';
  if(_.isString(input)) return input.substr(0, 1);
  return _.first(input);
};


/**
 * Return last element from `input`.
 *
 * @param {Mixed} input
 * @return {Mixed}
 * @api private
 */

module.exports.last = function (input) {
  if(typeof input === 'object' && !_.isArray(input)) return '';
  if(_.isString(input)) return input.slice(-1);
  return _.last(input);
};


/**
 * Return length of `input`.
 *
 * @param {Mixed} input
 * @return {Integer}
 * @api private
 */

module.exports.length = function (input) {
  if(typeof input === 'object') return _.keys(input).length;
  return input.length;
};


/**
 * Reverse `input`.
 *
 * @param {Mixed} input
 * @return {Integer}
 * @api private
 */

module.exports.reverse = function (input) {
  if(_.isArray(input)) return input.reverse();
  return input;
};


/**
 * Join `input` with `separator`.
 *
 * @param {Mixed} input
 * @param {String} separator
 * @return {Mixed}
 * @api private
 */

module.exports.join = function (input, separator) {
  if(_.isArray(input)) return input.join(separator);
  if(typeof input === 'object') {
    var acc = [];
    _.each(input, function (value, key) {
      acc.push(value);
    });
    return acc.join(separator);
  }
  return input;
};


/**
 * Encode `input` to URL component.
 *
 * @param {Mixed} input
 * @return {Mixed}
 * @api private
 */

module.exports.urlencode = function(input) {
  return encodeURIComponent(input);
};


/**
 * Decode `input` from URL component.
 *
 * @param {Mixed} input
 * @return {Mixed}
 * @api private
 */


module.exports.urldecode = function(input) {
  return decodeURIComponent(input);
};


/**
 * Replace `search` by `replacement` in `input`, with `flags`.
  *
 * @param {String} input
 * @param {String} replacement
 * @param {String} [flags]
 * @return {String}
 * @api private
 */

module.exports.replace = function(input, search, replacement, flags) {
  return input.replace(new RegExp(search, flags), replacement);
};
