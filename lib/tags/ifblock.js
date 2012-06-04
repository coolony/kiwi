/*!
 * Coolony's Kiwi
 * Copyright ©2012 Pierre Matri <pierre.matri@coolony.com>
 * MIT Licensed
 */


/**
 * Constants
 */

var IFBLOCK_PARSE_RE = /^ifblock\s+([^\s]+)$/;


/**
 * Global variables
 */

module.exports.tags = {};
var ifBlockTag = module.exports.tags.ifblock = {};


/**
 * Basic tag settings
 */

ifBlockTag.isBlock = true;


/**
 * Compile `token` with `compiledContents` to JavaScript, and invoke
 * `callback(err, compiled)`.
 *
 * @param {BlockToken} token
 * @param {String} compiledContents
 * @param {Function} callback
 * @api private
 */

ifBlockTag.compile = function(token, compiledContents,
                              compiledIntermediate, compiler, callback) {

  var parsed = token.tag.match(IFBLOCK_PARSE_RE);

  if(!parsed) {
    return callback(new Error(  'Compilation error: Unable to parse tag `'
                              + token.tag
                              + '`.')
                              );
  }

  var name = parsed[1];

  var compiled =   'if(!_.isUndefined(__blocks["' + name + '"])) {'
                 +   compiledContents
                 + '}'

  callback(null, compiled);
}
