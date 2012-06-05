/*!
 * Coolony's Kiwi
 * Copyright ©2012 Pierre Matri <pierre.matri@coolony.com>
 * MIT Licensed
 */


/**
 * Constants
 */

var BLOCK_PARSE_RE = /^block\s+([^\s]+)(?:\s+(append|prepend))?$/;


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

blockTag.compile = function(token, compiledContents,
                            compiledIntermediate, compiler, callback) {

  var parsed = token.tag.match(BLOCK_PARSE_RE);

  if(!parsed) {
    return callback(new Error(  'Compilation error: Unable to parse tag `'
                              + token.tag
                              + '`.')
                              );
  }

  var name = parsed[1];
  var mode = parsed[2];

  var compiled =   '(function(parentAcc) {'
                 +   'var __acc = [];'
                 +   'if(_.isUndefined(__blocks["' + name + '"]) || __blocks["' + name + '"].mode) {'
                 +     'if(__blocks["' + name + '"] && __blocks["' + name + '"].mode == "append") {'
                 +       '__acc.push(__blocks["' + name + '"]);'
                 +     '}'
                 +     compiledContents
                 +     'if(__blocks["' + name + '"] && __blocks["' + name + '"].mode == "prepend") {'
                 +       '__acc.push(__blocks["' + name + '"]);'
                 +     '}'
                 +   '} else {'
                 +     '__acc.push(__blocks["' + name + '"]);'
                 +   '}'
                 +   'var __joined = new String(__acc.join(""));'
                 +   (mode ? ('__joined.mode = "' + mode + '";') : '')
                 +   'parentAcc.push(__joined);'
                 +   '__blocks["' + name + '"] = __joined;'
                 + '})(__acc);'

  callback(null, compiled);
}
