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

  it('should properky handle `append` and `prepend` directives.', function(done) {

    function onLoaded(err, data) {
      if(err) return done(err);
      template.render({}, onRendered)
    }

    function onRendered(err, rendered) {
      if(err) return done(err);
      rendered.trim().should.equal('foo doo boo woo koo loo');
      done();
    }

    template.loadFile(__dirname + '/../fixtures/block.kiwi', onLoaded);
  });

});

describe('Parent tag', function() {

  var template;

  beforeEach(function() {
    template = new Template({cache: false});
  });

  it('should be properly handeled.', function(done) {

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

  it('should throw an error when used outside of a block tag.', function(done) {

    template.template = '{{parent}}';
    template.render({}, function(err, rendered) {
      err.message.should.equal('Compilation error: `parent` must be immediate child of a `block` tag.');
      done();
    })

  });

  it('should work properly with variables and multiple parent tags.', function(done) {

    template.loadAndRender(__dirname + '/../fixtures/parent_var.kiwi', {somevar: 'hello', somevar2: 'kiwi'}, function(err, rendered) {
      if(err) return done(err);
      rendered.should.equal('before afterbefore kiwi inside hello stillinside beforeafter inside hello stillinside after');
      done();
    });

  });

});