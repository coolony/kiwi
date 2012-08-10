/*!
 * Coolony's Kiwi
 * Copyright ©2012 Pierre Matri <pierre.matri@coolony.com>
 * MIT Licensed
 */


/**
 * Constants
 */

var EACH_PARSE_RE = /^each(?:\(([^\)\s]+)\s*\,\s*([^\)\s]+)\s*\))?\s+(.*)$/;


/**
 * Global variables
 */

module.exports.tags = {};
var eachTag = module.exports.tags.each = {};
var intermediateTags = eachTag.intermediateTags = {};
var emptyTag = intermediateTags.empty = {};


/**
 * Basic tag settings
 */

eachTag.isBlock = true;
eachTag.headDeclarations = 'var $each = undefined;';


/**
 * Compile `token` with `compiledContents` to JavaScript, and invoke
 * `callback(err, compiled)`.
 *
 * @param {BlockToken} token
 * @param {String} compiledContents
 * @param {Function} callback
 * @api private
 */

eachTag.compile = function(token, compiledContents,
                              compiledIntermediate, compiler, callback) {
  var parsed = token.tag.match(EACH_PARSE_RE);

  if(!parsed) {
    return callback(new Error('Compilation error: Unable to parse tag `' +
                              token.tag +
                              '`.'
                              ));
  }

  var elementVariable = parsed[1] || '$value';
  var indexVariable = parsed[2] || '$index';
  var collection = parsed[3];
  var ifEmpty;

  // If we have an intermediate tag
  if(compiledIntermediate.length) {

    // Ensure there is only one tag
    if(compiledIntermediate.length > 1) {
      return callback(new Error('Compilation Error: Too many intermediate ' +
                                'tags for `each`.'
                                ));
    }

    // Check tag
    if(token.intermediate[0].tag !== 'empty') {
      return callback(new Error('Compilation Error: Unexpected tag `' +
                                token.intermediate[0].tag +
                                '`.'
                                ));
    }

    ifEmpty = compiledIntermediate[0];
  }

  // Actually compile tag
  var compiled = '(function(__parentEachLoop) {';

  // Add loop collection part
  if(!token.options.strict) {
    compiled += 'try {' +
                  '__tmp = ' + collection +
                '} catch(__err) {' +
                  'if(__err instanceof ReferenceError) {' +
                    '__tmp = [];' +
                  '} else {' +
                    'throw __err;' +
                  '}' +
                '}';
  }
  else {
    compiled += '__tmp = ' + collection + ';';
  }

  // Calculate loop collection length
  compiled +=   'var __eachLoopLength = _.size(__tmp);' +
                'var _eachLoop, $each;';

  // Add the empty start part
  if(ifEmpty) compiled += 'if(__eachLoopLength) {';

  // Call each
  if(token.options.eachCounters) {
    compiled += 'var __eachLoopCounter = 0;' +
                '_.each(__tmp, ' +
                'function(' + elementVariable + ',' + indexVariable + '){' +
                  '$each = _eachLoop = {' +
                    'size: __eachLoopLength,' +
                    'counter0: __eachLoopCounter,' +
                    'counter: __eachLoopCounter + 1,' +
                    'revcounter0: __eachLoopLength - __eachLoopCounter - 1,' +
                    'revcounter: __eachLoopLength - __eachLoopCounter,' +
                    'first: __eachLoopCounter === 0,' +
                    'last: __eachLoopCounter + 1 === __eachLoopLength,' +
                    'parentLoop: __parentEachLoop,' +
                    'parent: __parentEachLoop,' +
                    '_index: ' + indexVariable + ',' +
                    '_value: ' + elementVariable +
                  '};' +
                  'if(__parentEachLoop) {' +
                    '$each.parentIndex = __parentEachLoop._index;' +
                    '$each.parentValue = __parentEachLoop._value;' +
                  '}' +
                  compiledContents +
                  '__eachLoopCounter++;' +
                '});';
  }
  else {
    compiled += '_.each(__tmp, ' +
                'function(' + elementVariable + ',' + indexVariable + ') {' +
                  compiledContents +
                '});';
  }

  // Add the empty remaining part, if requested
  if(ifEmpty) {
    compiled += '} else {' +
                  ifEmpty +
                '}';
  }

  compiled += '})($each);';

  callback(null, compiled);
};
