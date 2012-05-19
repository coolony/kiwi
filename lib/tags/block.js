/*!
 * Coolony's Kiwi
 * Copyright ©2012 Pierre Matri <pierre.matri@coolony.com>
 * MIT Licensed
 */


/**
 * Constants
 */

var BLOCK_PARSE_RE = /^block\s+([^\s]+)$/;


/**
 * Global variables
 */

module.exports.tags = {};
var blockTag = module.exports.tags.block = {};


/**
 * Basic tag settings
 */

blockTag.isBlock = true;


/**
 * Compile `token` with `compiledContents` to JavaScript, and invoke
 * `callback(err, compiled)`.
 *
 * @param {BlockToken} token
 * @param {String} compiledContents
 * @param {Function} callback
 * @api private
 */

blockTag.compileTag = function(token, compiledContents,
                            compiledIntermediate, compiler, callback) {

  var parsed = token.tag.match(BLOCK_PARSE_RE);

  if(!parsed) {
    return callback(new Error(  'Compilation error: Unable to parse tag `'
                              + token.tag
                              + '`.')
                              );
  }

  var name = parsed[1];

  var compiled =   '(function(parentAcc) {'
                 +   'var __acc = [];'
                 +   'if(_.isUndefined(__blocks["' + name + '"])) {'
                 +     compiledContents
                 +   '} else {'
                 +     '__acc.push(__blocks["' + name + '"])'
                 +   '}'
                 +   'var __joined = __acc.join("");'
                 +   'parentAcc.push(__joined);'
                 +   '__blocks["' + name + '"] = __joined;'
                 + '})(__acc);'

  callback(null, compiled);
}
