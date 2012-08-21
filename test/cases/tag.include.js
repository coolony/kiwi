/*!
 * Coolony's Kiwi
 * Copyright ©2012 Pierre Matri <pierre.matri@coolony.com>
 * MIT Licensed
 */


var should = require('should');
var Template = require('../../lib/template');

describe('Include tag', function() {

  it('should include template with Template instance as child', function(done) {
  
    var template = new Template({ cache: true });
    var childTemplate = new Template({ cache: true });
      
    function onChildTemplateLoaded(err, data) {
      should.not.exist(err);
      template.loadAndRender(__dirname + '/../fixtures/root.kiwi', {child: childTemplate}, onRendered);
    }
  
    function onRendered(err, rendered) {
      should.not.exist(err);
      rendered.trim().should.equal('foo bar woo loo');
      done(err);
    }
      
    childTemplate.loadFile(__dirname + '/../fixtures/include_dynamic.kiwi', onChildTemplateLoaded);
  });
});
