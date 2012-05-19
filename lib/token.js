/*!
 * Coolony's Kiwi
 * Copyright ©2012 Pierre Matri <pierre.matri@coolony.com>
 * MIT Licensed
 */


/*
 * Module dependencies
 */

var _ = require('underscore');
var frame = require('frame');
var extend = frame.classes.extend;

var utils = require('./utils');


/*
 * Base token
 */


/*
 * Initializes `BaseToken`, with `parent` and `root`.
 *
 * @api private
 * @constructor
 */

function BaseToken(root, parent, options) {
  this.parent = parent;
  this.children = [];
  this.tag = null;
  this.tagType = null;
  this.options = options;
  this.root = root;
}


/*
 * Stub for the `compile` method, to be overloaded, ivoking
 * `callback(err, compiled)`
 *
 * @param {Function} callback
 * @api private
 */

BaseToken.prototype.compile = function(compiler, callback) {
  callback(new Error('Stub method BaseToken#compile must be overloaded'));
}


/*
 * Look for `tag` definition in global tags, or in current token's special tags.
 * Return the first matched tag.
 *
 * @param {String} tag
 * @return {Object} Tag definition for `tag`
 * @api private
 */

BaseToken.prototype.lookupTag = function(tag) {
  if(tags[tag]) return tags[tag];
  if(   this.tagType
     && this.tagType.intermediateTags
     && this.tagType.intermediateTags[tag]) {
    this.tagType.intermediateTags[tag].isIntermediate = true;
    return this.tagType.intermediateTags[tag];
  }
}


/*
 * Literal token
 */


/*
 * Initialize `LiteralToken`, with `parent`, `root` and `literal`
 *
 * @param {String} literal
 * @param {BaseToken} parent
 * @api private
 * @extends BaseToken
 * @constructor
 */

function LiteralToken(literal, root, parent, options) {
  LiteralToken._superclass.call(this, root, parent, options);
  this.literal = literal;
}
extend(LiteralToken, BaseToken);


/*
 * Compile `LiteralToken` to JavaScript, and invoke `callback(err, compiled)`
 *
 * @param {Function} callback (Optional)
 * @api private
 */

LiteralToken.prototype.compile = function(compiler, callback) {
  this._compiled =   '__acc.push("'
                   + utils.escapeCompiledString(this.literal)
                   + '");';

  callback(null, this._compiled);
}


/*
 * Root token
 */


/*
 * Initialize `RootToken`, with `children`
 *
 * @param {BaseToken[]} children [children]
 * @api private
 * @extends BaseToken
 * @constructor
 */

function RootToken(children, options) {
  RootToken._superclass.call(this, this, null, options);
  if(!children) children = [];
  this.head = [];
  this.children = children;
}
extend(RootToken, BaseToken);


/*
 * Compile `RootToken` to JavaScript, and invoke `callback(err, compiled)`
 *
 * @param {Function} callback (Optional)
 * @api private
 */

RootToken.prototype.compile = function(compiler, callback) {
  var _this = this;

  function onCompiled(err, compiled) {
    if(err) return callback(err);
    var compiled =   'var __acc = [];'
                   + 'var __blocks = {};'
                   + 'if(__template.options && __template.options._parent) {'
                   +   '__blocks = __template.options._parent.blocks;'
                   + '}'
                   + 'var __tmp;'
                   + 'var __err;'
                   + '__data = __data || {};'
                   + headDeclarations.join('')
                   + 'with(__data) {'
                   +   compiled
                   +   footDeclarations.join('')
                   +   'var __compiled = new String(__acc.join(""));'
                   +   '__compiled.blocks = __blocks;'
                   +   '__callback(null, __compiled);'
                   +   compiler.__compilationEnd.join('')
                   + '}';
    _this._compiled = compiled;
    callback(null, compiled);
  };

  utils.compileTokens(this.children, compiler, onCompiled);
}


/*
 * Block token
 */


/*
 * Initialize `BlockToken` for `tag` of `tagType` with `parent` and `children`
 *
 * @param {Object} tag
 * @param {BaseToken} parent
 * @param {BaseToken[]} [children]
 * @api private
 * @extends BaseToken
 * @constructor
 */

function BlockToken(tag, tagType, root, parent, children, options) {
  BlockToken._superclass.call(this, root, parent, options);
  this.tag = tag;
  this.tagType = tagType;
  if(!children) children = [];
  this.children = children;
  this.intermediate = [];
}
extend(BlockToken, BaseToken);


/*
 * Compile `BlockToken` to JavaScript, and invoke `callback(err, compiled)`
 *
 * @param {Function} callback (Optional)
 * @api private
 */

BlockToken.prototype.compile = function(compiler, callback) {
  var _this = this;
  var compiledContents;
  var compiledIntermediate;

  function onContentsCompiled(err, compiled) {
    if(err) return callback(err);
    compiledContents = compiled;
    utils.compileTokenArray(_this.intermediate, compiler,
                            onIntermediateCompiled);
  }

  function onIntermediateCompiled(err, compiled) {
    if(err) return callback(err);
    compiledIntermediate = compiled;
    _this.tagType.compile(_this, compiledContents,
                             compiledIntermediate, compiler,
                             onCompiled);
  }

  function onCompiled(err, compiled) {
    if(err) return callback(err);
    _this._compiled = compiled;
    callback(null, compiled);
  }

  utils.compileTokens(this.children, compiler, onContentsCompiled);
}


/*
 * Leaf token
 */


/*
 * Initialize `LeafToken` for `tag` of `tagType` with `parent`
 *
 * @param {Object} tag
 * @param {BaseToken} parent
 * @param {BaseToken[]} [children]
 * @api private
 * @extends BaseToken
 * @constructor
 */

function LeafToken(tag, tagType, root, parent, options) {
  LeafToken._superclass.call(this, root, parent, options);
  this.tag = tag;
  this.tagType = tagType;
}
extend(LeafToken, BaseToken);


/*
 * Compile `LeafToken` to JavaScript, and invoke `callback(err, compiled)`
 *
 * @param {Function} callback (Optional)
 * @api private
 */

LeafToken.prototype.compile = function(compiler, callback) {
  var _this = this;

  function onCompiled(err, compiled) {
    if(err) return callback(err);
    _this._compiled = compiled;
    callback(null, compiled);
  }

  var compiled = this.tagType.compile(this, null, compiler, onCompiled);
}


/*
 * Initialize `IntermediateToken` for `tag` of `tagType` with `parent`
 * and `children`
 *
 * @param {Object} tag
 * @param {BaseToken} parent
 * @param {BaseToken[]} [children]
 * @api private
 * @extends BaseToken
 * @constructor
 */

function IntermediateToken(tag, tagType, root, parent, children, options) {
  IntermediateToken._superclass.call(this, tag, tagType, root,
                              parent, children, options);
}
extend(IntermediateToken, BlockToken);


/*
 * Compile `IntermediateToken` to JavaScript, and invoke
 * `callback(err, compiled)`
 *
 * @param {Function} callback (Optional)
 * @api private
 */

IntermediateToken.prototype.compile = function(compiler, callback) {
  var _this = this;

  function onContentsCompiled(err, compiledContents) {
    if(err) return callback(err);
    callback(null, compiledContents);
  }

  utils.compileTokens(this.children, compiler, onContentsCompiled);
}


/*
 * Look for `tag` definition in global tags, or in current token's special tags.
 * Return the first matched tag.
 *
 * @param {String} tag
 * @return {Object} Tag definition for `tag`
 * @api private
 */

IntermediateToken.prototype.lookupTag = function(tag) {
  return this.parent.lookupTag(tag);
}


/*
 * Module exports
 */

module.exports = {
  headDeclarations: [],
  BaseToken: BaseToken,
  RootToken: RootToken,
  BlockToken: BlockToken,
  IntermediateToken: IntermediateToken,
  LeafToken: LeafToken,
  LiteralToken: LiteralToken
}
var headDeclarations = module.exports.headDeclarations = [];
var footDeclarations = module.exports.footDeclarations = [];
var tags = module.exports.tags = {};
var tagBeforeProcessors = module.exports.tagBeforeProcessors = [];
var helpers = module.exports.helpers = {};


/*
 * Read tags from tags directory
 */

(function loadTags() {
  var loadedFiles = frame.files.requireDir(__dirname + '/tags/');
  for(file in loadedFiles) {
    var fileTags = loadedFiles[file].tags;
    var fileHelpers = loadedFiles[file].helpers;

    // Process tags
    for(tag in fileTags) {
      var currentTag = fileTags[tag];
      if(currentTag.beforeProcessor) {
        if(currentTag.beforeProcessorPrepend) {
          tagBeforeProcessors.unshift(currentTag.beforeProcessor);
        } else {
          tagBeforeProcessors.push(currentTag.beforeProcessor);
        }
      }
      if(currentTag.headDeclarations) {
        headDeclarations.push(currentTag.headDeclarations);
      }
      if(currentTag.footDeclarations) {
        footDeclarations.push(currentTag.footDeclarations);
      }
      tags[tag] = currentTag;
      currentTag.tagName = tag;
    }

    // Process registered functions
    if(fileHelpers) _.extend(helpers, fileHelpers);
  }
})();
