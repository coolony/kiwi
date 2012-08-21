/*!
 * Coolony's Kiwi
 * Copyright ©2012 Pierre Matri <pierre.matri@coolony.com>
 * MIT Licensed
 */


var should = require('should');
var Template = require('../../lib/template');

describe('Extend tag', function() {

  var template;

  beforeEach(function() {
    template = new Template({cache: true});
  });

  it('should extend template', function(done) {

    function onLoaded(err, data) {
      if(err) return done(err);
      template.render({}, onRendered)
    }

    function onRendered(err, rendered) {
      if(err) return done(err);
      rendered.trim().should.equal('foo doo woo roo');
      done(err);
    }

    template.loadFile(__dirname + '/../fixtures/leaf.kiwi', onLoaded);
  });

  it('should extend template with dynamic parent', function(done) {

    function onLoaded(err, data) {
      if(err) return done(err);
      template.render({parent: 'intermediate'}, onRendered)
    }

    function onRendered(err, rendered) {
      if(err) return done(err);
      rendered.trim().should.equal('foo doo woo moo');
      done(err);
    }

    template.loadFile(__dirname + '/../fixtures/dynamic.kiwi', onLoaded);
  });
  
  it('should extend template with Template instance as parent', function(done) {
  
    var parentTemplate = new Template({ cache: true });
      
    function onParentTemplateLoaded(err, data) {
      if(err) return done(err);
      template.loadFile(__dirname + '/../fixtures/dynamic.kiwi', onLoaded);
    }
  
    function onLoaded(err, data) {
      if(err) return done(err);
      template.render({parent: parentTemplate}, onRendered)
    }
  
    function onRendered(err, rendered) {
      if(err) return done(err);
      rendered.trim().should.equal('foo doo woo moo');
      done(err);
    }
      
    parentTemplate.loadFile(__dirname + '/../fixtures/intermediate.kiwi', onParentTemplateLoaded);
  });
  
  it('should extend template with additional context', function(done) {
  
    function onLoaded(err, data) {
      if(err) return done(err);
      template.render({someContext: {somevar: 'HWYHO'}}, onRendered)
    }
  
    function onRendered(err, rendered) {
      if(err) return done(err);
      rendered.trim().should.equal('before inside HWYHO stillinside after');
      done();
    }
  
    template.loadFile(__dirname + '/../fixtures/extend_context.kiwi', onLoaded);
  });
    

  it('should properly cache paths', function(done) {
    var calls = 0;

    function onLoaded(err, data) {
      should.not.exist(err);
      template.render({}, onFirstRender)
    }

    function onFirstRender(err, rendered) {
      if(err) return done(err);
      rendered.trim().should.equal('foo doo woo loo');
      calls.should.equal(1);
      template.render({}, onSecondRender)
    }

    function onSecondRender(err, rendered) {
      if(err) return done(err);
      rendered.trim().should.equal('foo doo woo loo');
      calls.should.equal(1);
      done(err);
    }

    function lookupTemplate(name, parent, callback) {
      calls++;
      callback(null, __dirname + '/../fixtures/root.kiwi');
    }

    template.options.lookup = lookupTemplate;
    template._getCache().dirty();
    template.loadFile(__dirname + '/../fixtures/intermediate.kiwi', onLoaded);
  });
});
