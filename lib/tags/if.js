/*!
 * Coolony's Kiwi
 * Copyright ©2012 Pierre Matri <pierre.matri@coolony.com>
 * MIT Licensed
 */


/**
 * Module dependencies
 */

// if node
var _ = require('underscore');
// end


/**
 * Constants
 */

var IF_PARSE_RE = /^if\s+(.*)$/;
var ELSE_PARSE_RE = /^else(?:\s+(.*))?$/;


/**
 * Global variables
 */

module.exports.tags = {};
var ifTag = module.exports.tags['if'] = {};
var intermediateTags = ifTag.intermediateTags = {};
var elseTag = intermediateTags['else'] = {};


/**
 * Global functions
 */


/**
 * Outputs `if` clause based on `condition`. If not `strict`,
 * actual test will be wrapped in a `try…catch` statement to catch
 * ReferenceErrors silently
 *
 * @param {String} condition
 * @param {Boolean} strict
 * @return {String}
 * @api private
 */

function createIfCondition(condition, strict) {
  var compiled;
  if(strict) {
    compiled = 'if(' + condition + ')';
  } else {
    compiled = 'try {' +
                 '__tmp = ' + condition +
               '} catch(__err) {' +
                 'if(__err instanceof ReferenceError) {' +
                   '__tmp = false;' +
                 '} else {' +
                   'throw __err;' +
                 '}' +
               '}' +
               'if(__tmp)';
  }
  return compiled;
}


/**
 * Basic tag settings
 */

ifTag.isBlock = true;


/**
 * Compile `token` with `compiledContents` to JavaScript, and invoke
 * `callback(err, compiled)`.
 *
 * @param {BlockToken} token
 * @param {String} compiledContents
 * @param {Function} callback
 * @api private
 */

ifTag.compile = function(token, compiledContents,
                            compiledIntermediate, compiler, callback) {
  var parsed = token.tag.match(IF_PARSE_RE);

  if(!parsed) {
    return callback(new Error('Compilation error: Unable to parse tag `' +
                              token.tag +
                              '`.'
                              ));
  }

  var condition = parsed[1];
  var appendEnd = ['}'];

  // Handle basic if
  var compiled = createIfCondition(condition, token.options.strict);
  compiled += '{' + compiledContents;

  // Handle else
  var err;
  _.each(token.intermediate, function(intermediate, index) {
    var intermediateTag = intermediate.tag;
    var compiledIntermediateTag = compiledIntermediate[index];
    var parsed = intermediateTag.match(ELSE_PARSE_RE);

    if(!parsed) {
      err = new Error('Compilation error: Unable to parse tag `' +
                      token.tag +
                      '`.'
                      );
      return;
    }

    var condition = parsed[1];
    if(!condition) {
      compiled += '} else {';
    } else {
      appendEnd.push('}');
      compiled += '} else {' +
                  createIfCondition(condition, token.options.strict) +
                  '{';
    }

    compiled += compiledIntermediate[index];
  });

  // Handle error
  if(err) return callback(err);

  // Return
  compiled += appendEnd.join('');
  callback(null, compiled);
};
