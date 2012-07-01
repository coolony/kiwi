/*!
 * Coolony's Kiwi
 * Copyright ©2012 Pierre Matri <pierre.matri@coolony.com>
 * MIT Licensed
 */


var should = require('should');
var Template = require('../../lib/template');

describe('Block tag', function() {

  var template;

  beforeEach(function() {
    template = new Template({cache: false});
  });

  it('should properky handle `append` and `prepend` directives', function(done) {

    function onLoaded(err, data) {
      if(err) return done(err);
      template.render({}, onRendered)
    }

    function onRendered(err, rendered) {
      if(err) return done(err);
      rendered.trim().should.equal('foo boo doo woo loo koo');
      done();
    }

    template.loadFile(__dirname + '/../fixtures/block.kiwi', onLoaded);
  });
  
  it('should properky handle `parent` tag', function(done) {

    function onLoaded(err, data) {
      if(err) return done(err);
      template.render({}, onRendered)
    }

    function onRendered(err, rendered) {
      if(err) return done(err);
      rendered.trim().should.equal('foo bar woo doo loo roo');
      done();
    }

    template.loadFile(__dirname + '/../fixtures/parent.kiwi', onLoaded);
  });
});