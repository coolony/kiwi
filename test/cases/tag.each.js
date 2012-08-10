/*!
 * Coolony's Kiwi
 * Copyright ©2012 Pierre Matri <pierre.matri@coolony.com>
 * MIT Licensed
 */


var should = require('should');
var Template = require('../../lib/template');

describe('Each loop counters', function() {

  var template;

  beforeEach(function() {
    template = new Template({cache: false});
  });
  
  it('should work properly with nested loops', function(done) {
    
    template.loadAndRender(__dirname + '/../fixtures/nested_each.kiwi', {
      data : {
        heading1: [ 'item1', 'item2', 'item3' ],
        heading2: [ 'item1', 'item2', 'item3' ]
      }
    }, function(err, rendered) {
      if(err) return done(err);
      rendered.should.equal('first heading1 item1 item2 item3 heading2 item1 item2 item3 last');
      done();
    });
    
  });
  
});