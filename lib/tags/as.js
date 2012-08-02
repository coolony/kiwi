/*!
 * Coolony's Kiwi
 * Copyright ©2012 Pierre Matri <pierre.matri@coolony.com>
 * MIT Licensed
 */


/**
 * Constants
 */

var AS_PARSE_RE = /^as\s+([^\s]+)$/;


/**
 * Global variables
 */

module.exports.tags = {};
var asTag = module.exports.tags.as = {};


/**
 * Basic tag settings
 */

asTag.isBlock = true;


/**
 * Compile `token` with `compiledContents` to JavaScript, and invoke
 * `callback(err, compiled)`.
 *
 * @param {BlockToken} token
 * @param {String} compiledContents
 * @param {Function} callback
 * @api private
 */

asTag.compile = function(token, compiledContents,
                         compiledIntermediate, compiler, callback) {

  var parsed = token.tag.match(AS_PARSE_RE);

  if(!parsed) {
    return callback(new Error('Compilation error: Unable to parse tag `' +
                              token.tag +
                              '`.'
                              ));
  }

  var name = parsed[1];

  var compiled = '(function(parentAcc) {' +
                   'var __acc = [];' +
                   compiledContents +
                   'var __joined = __acc.join("");' +
                   '$data["' + name + '"] = $tools.tools.safe(__joined);' +
                 '})(__acc);';

  callback(null, compiled);
};
