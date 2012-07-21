/*!
 * Coolony's Kiwi
 * Copyright ©2012 Pierre Matri <pierre.matri@coolony.com>
 * MIT Licensed
 */


/*
 * Module dependencies
 */

// if browser
var frame;
// end
// if node
var _ = require('underscore');
var frame = require('frame');
// end

var utils = require('./utils');
var inherits = frame ? frame.classes.extend : utils.inherits;


/*
 * Global variables
 */

var headDeclarations = [];
var footDeclarations = [];
var tags = {};
var tagBeforeProcessors = [];
var helpers = {};


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
};


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
  if(this.tagType && this.tagType.intermediateTags &&
                     this.tagType.intermediateTags[tag]) {

    this.tagType.intermediateTags[tag].isIntermediate = true;
    return this.tagType.intermediateTags[tag];
  }
};


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
inherits(LiteralToken, BaseToken);


/*
 * Compile `LiteralToken` to JavaScript, and invoke `callback(err, compiled)`
 *
 * @param {Function} callback (Optional)
 * @api private
 */

LiteralToken.prototype.compile = function(compiler, callback) {
  this._compiled = '__acc.push("' +
                   utils.escapeCompiledString(this.literal) +
                   '");';

  callback(null, this._compiled);
};


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
inherits(RootToken, BaseToken);


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
    compiled = 'var __this = this;' +
               'var __acc = [];' +
               'var __blocks = {};' +
               'if(__template.options && __template.options._parent) {' +
                 '__blocks = __template.options._parent.blocks;' +
               '}' +
               'var __tmp;' +
               'var __err;' +
               '__data = __data || {};' +
               headDeclarations.join('') +
               'with(__data) {' +
                 compiled +
                 footDeclarations.join('') +
                 'var __compiled = new String(__acc.join(""));' +
                 '__compiled.blocks = __blocks;' +
                 '__callback(null, __compiled);' +
                 compiler.__compilationEnd.join('') +
               '}';
    _this._compiled = compiled;
    callback(null, compiled);
  }

  utils.compileTokens(this.children, compiler, onCompiled);
};


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
inherits(BlockToken, BaseToken);


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
  var compile = this.tagType.compile;
  var compilationFunction = compile.joinCompilationResult !== false ?
                              'compileTokens' : 'compileTokenArray';

  function onContentsCompiled(err, compiled) {
    if(err) return callback(err);
    compiledContents = compiled;
    utils.compileTokenArray(_this.intermediate, compiler,
                            onIntermediateCompiled);
  }

  function onIntermediateCompiled(err, compiled) {
    if(err) return callback(err);
    compiledIntermediate = compiled;
    compile(_this, compiledContents,
            compiledIntermediate, compiler,
            onCompiled);
  }

  function onCompiled(err, compiled) {
    if(err) return callback(err);
    _this._compiled = compiled;
    callback(null, compiled);
  }

  utils[compilationFunction](this.children, compiler, onContentsCompiled);
};


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
inherits(LeafToken, BaseToken);


/*
 * Compile `LeafToken` to JavaScript, and invoke `callback(err, compiled)`
 *
 * @param {Compiler} compiler
 * @param {Function} callback
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
};


/*
 * Untokenize `LeafToken`, and return the result.
 *
 * @param {Compiler} compiler
 * @return {String}
 * @api private
 */

LeafToken.prototype.untokenize = function(compiler) {
  return this.tagType.compile.untokenize ?
           this.tagType.compile.untokenize(this, compiler) :
           ('{{' + this.tag + '}}');
};


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
inherits(IntermediateToken, BlockToken);


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
};


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
};


/**
 * Register `tag` with name `name`.
 *
 * @param {String} name
 * @param {Function} tag
 * @api public
 */

function registerTag(name, tag) {
  if(tag.beforeProcessor) {
    if(tag.beforeProcessorPrepend) {
      tagBeforeProcessors.unshift(tag.beforeProcessor);
    } else {
      tagBeforeProcessors.push(tag.beforeProcessor);
    }
  }
  if(tag.headDeclarations) {
    headDeclarations.push(tag.headDeclarations);
  }
  if(tag.footDeclarations) {
    footDeclarations.push(tag.footDeclarations);
  }
  if(tag.helpers) {
    for(var helperName in tag.helpers) {
      registerHelper(helperName, tag.helpers[helperName]);
    }
  }
  tags[name] = tag;
  tag.tagName = name;
}


/**
 * Register `helper` with name `name`.
 *
 * @param {String} name
 * @param {Function} helper
 * @api public
 */

function registerHelper(name, helper) {
  helpers[name] = helper;
}


/*
 * Module exports
 */

module.exports = {
  BaseToken: BaseToken,
  RootToken: RootToken,
  BlockToken: BlockToken,
  IntermediateToken: IntermediateToken,
  LeafToken: LeafToken,
  LiteralToken: LiteralToken,
  headDeclarations: headDeclarations,
  footDeclarations: footDeclarations,
  tags: tags,
  tagBeforeProcessors: tagBeforeProcessors,
  helpers: helpers,
  registerTag: registerTag,
  registerHelper: registerHelper
};


/*
 * Read tags from tags directory
 */

function loadTags(loadedFiles) {
  loadedFiles = loadedFiles || frame.files.requireDir(__dirname + '/tags/');
  for(var file in loadedFiles) {
    var fileTags = loadedFiles[file].tags;
    var fileHelpers = loadedFiles[file].helpers;

    // Process tags
    for(var tag in fileTags) {
      registerTag(tag, fileTags[tag]);
    }

    // Process tags
    if(fileHelpers) {
      for(var helperName in fileHelpers) {
        registerHelper(helperName, fileHelpers[helperName]);
      }
    }
  }
}

// if node
loadTags();
// end
// if browser
// var files = [
//   'block', 'comment', 'each', 'if', 'print', 'raw', 'tmpl', 'ifblock', 'as'
// ];
// var acc = {};
// _.each(files, function(file) {
//   acc[file] = require('./tags/' + file);
// });
// loadTags(acc);
// endif





