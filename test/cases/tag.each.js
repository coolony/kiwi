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
        heading2: [ 'item4', 'item5', 'item6' ]
      }
    }, function(err, rendered) {
      if(err) return done(err);
      rendered.should.equal('first heading1 item1 item2 item3 heading2 item4 item5 item6 last');
      done();
    });
    
  });
  
  it('should allow access to parent loop', function(done) {
    
    template.loadAndRender(__dirname + '/../fixtures/nested_each_parent.kiwi', {
      data : {
        heading1: [ 'item1', 'item2', 'item3' ],
        heading2: [ 'item4', 'item5', 'item6' ]
      }
    }, function(err, rendered) {
      if(err) return done(err);
      rendered.should.equal('1 heading1 item1 1 heading1 item1 1 heading1 item1 2 heading2 item4 2 heading2 item4 2 heading2 item4 ');
      done();
    });
    
  });
  
});