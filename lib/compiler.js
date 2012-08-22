/*!
 * Coolony's Kiwi
 * Copyright ©2012 Pierre Matri <pierre.matri@coolony.com>
 * MIT Licensed
 */


/**
 * Module dependencies
 */

var token = require('./token');
var utils = require('./utils');


/**
 * Constants
 */

var TAG_OPENING_DELIMITER = '{{';
var TAG_CLOSING_DELIMITER = '}}';
var TAG_OPENING_DELIMITER_LENGTH = TAG_OPENING_DELIMITER.length;
var TAG_NAME_MATCH = /^(\/)?\s*([^\s\}\(]*)/;


/**
 * Initialize `Compiler` with the given `Template`, from the given `source`,
 * with `options`.
 *
 * @param {String} source
 * @api private
 */

var Compiler = module.exports = function(template) {
  this.template = template;
  this.source = template.template;
  this.options = template.options;
  this.helpers = {};
  this.__compilationEnd = [];
};


/**
 * Compile template to a native JS function, and invoke
 * `callback(err, compiled)`.
 *
 * @param {Function} callback
 * @api private
 */

Compiler.prototype.compile = function(callback) {
  var _this = this;

  // Callback for utils.applyAll
  function onProcessed(err, processed) {
    if(err) return callback(err);
    _this._tokenize(processed, onTokenized);
  }

  // Callback for Compiler#_tokenize
  function onTokenized(err, tokenized) {
    if(err) return callback(err);
    tokenized.compile(_this, onCompiled);
  }

  // Callback for Compiler#_compileTokens
  function onCompiled(err, compiled) {
    if(err) return callback(err);

    var func;

    try {
      func = new Function("$template",
                          "$tools",
                          "_",
                          "$data",
                          "$helpers",
                          "$callback",
                          compiled);
    } catch(err) {
      return callback(err);
    }

    func.$helpers = _this.helpers;

    callback(null, func);
  }

  // Apply tag before processors
  utils.applyAll(this.source, token.tagBeforeProcessors, [this], onProcessed);
};


/**
 * Tokenize template, and invoke `callback(err, tokenized)`.
 *
 * @param {Function} callback
 * @api private
 */

Compiler.prototype._tokenize = function(source, callback) {
  var workingSource = source;
  var currentToken = new token.RootToken();
  var rootToken = currentToken;
  var inToken = false;
  var currentPart;

  // Lookup templates in document, and build parse tree
  while(true) {
    var nextInflexion = workingSource.search(inToken ?
                                               TAG_CLOSING_DELIMITER :
                                               TAG_OPENING_DELIMITER
                                             );

    if(nextInflexion === -1) {
      this._pushLiteralToken(rootToken, currentToken, workingSource);
      break;
    } else {
      if(inToken) nextInflexion = nextInflexion + TAG_OPENING_DELIMITER_LENGTH;

      currentPart = workingSource.slice(0, nextInflexion);
      workingSource = workingSource.slice(nextInflexion);

      if(!inToken) {
        this._pushLiteralToken(rootToken, currentToken, currentPart);
      } else {
        currentPart = currentPart.slice(2, -2);
        try {
          currentToken = this._pushToken(rootToken, currentToken, currentPart);
        } catch(err) {
          return callback(err);
        }
      }

      inToken = !inToken;
    }
  }

  // Ensure we are at root level
  if(rootToken !== currentToken) {
    return callback(new Error('Tokenization error: unexpected end of file, ' +
                              'expected `' +
                              currentToken.tag.tagName +
                              '`.'
                              ));
  }

  callback(null, rootToken);
};


/**
 * Create `LiteralToken` with `literal`, and append it to `parent`.
 *
 * @param {BaseToken} parent
 * @param {String} literal
 * @api private
 */

Compiler.prototype._pushLiteralToken = function(root, parent, literal) {
  if(!literal.length) return;
  parent.children.push(new token.LiteralToken(literal, root));
};


/**
 * Create `BaseToken` from tag `tag`, and append it to `current`.
 * Return the new working token.
 *
 * @param {BaseToken} current
 * @param {String} tag
 * @return {BaseToken} New working token.
 * @api private
 */

Compiler.prototype._pushToken = function(root, current, tag) {
  var match = tag.match(TAG_NAME_MATCH);
  var tagName = match[2];
  var openingTag = match[1] !== '/';
  var tagType = current.lookupTag(tagName);
  var newToken;

  // Check whether we know this tag
  if(!tagType) {
    throw new Error('Tokenization error: Unknown tag `' + tagName + '`.');
  }

  // Handle intermediate tags
  if(tagType.isIntermediate) {

    // If we already are in an intermediate tag, close it
    if(current.tagType.isIntermediate) current = current.parent;

    // Push the tag to the stack
    newToken = new token.IntermediateToken(tag,
                                               tagType,
                                               root,
                                               current,
                                               [],
                                               this.options);
    current.intermediate.push(newToken);
    return newToken;

  }

  // Handle block tags
  else if(tagType.isBlock) {

    // Handle opening tags
    if(openingTag) {
      newToken = new token.BlockToken(tag,
                                      tagType,
                                      root,
                                      current,
                                      [],
                                      this.options);

      current.children.push(newToken);
      return newToken;

    // Handle closing tags
    } else {
      if(!current.parent) {
        throw new Error('Tokenization error: unexpected `' +
                        tagName +
                        '` tag at root level.'
                        );
      }

      if(current.tagType.isIntermediate) {
        current = current.parent;
      }

      if(current.tagType.tagName !== tagName) {
        throw new Error('Tokenization error: unexpected `' +
                        tagName +
                        '` tag, expected `' +
                        current.tag.tagName +
                        '`.'
                        );
      }
      return current.parent;
    }
  }

  // Handle leaf tags
  else {

    // Ensure we don't have a closing tag
    if(!openingTag) {
      throw new Error('Tokenization error: `' +
                      tagName +
                      '` is not a block tag.'
                      );
    }

    newToken = new token.LeafToken(tag,
                                   tagType,
                                   root,
                                   current,
                                   this.options);

    current.children.push(newToken);
    return current;
  }
};


Compiler.prototype.registerTemplateHelper = function(name, helper) {
  this.helpers[name] = helper;
};