/*!
 * Coolony's Kiwi
 * Copyright ©2012 Pierre Matri <pierre.matri@coolony.com>
 * MIT Licensed
 */


var should = require('should');
var kiwi = require('../../index');
var tools = kiwi.tools;

describe('Tools', function() {
  it('should be exposed', function() {
    kiwi.should.have.property('tools');
  });
  
  describe('createFilter', function() {
    it('should be exposed', function() {
      kiwi.tools.should.have.property('createFilter');
    });
    
    it('should correctly define tags', function(done) {
      tools.createFilter('prependA', function(str) {
        return 'A' + str;
      });
      new kiwi.Template('${foo|prependA}').render({foo:'bar'}, function(err, rendered) {
        if(err) return done(err);
        rendered.should.equal('Abar');
        done();
      });
    });
    
    it('should work with optional arguments', function(done) {
      tools.createFilter('prepend', function(str, thing) {
        return thing + str;
      });
      new kiwi.Template('${foo|prepend("woo ")}').render({foo:'bar'}, function(err, rendered) {
        if(err) return done(err);
        rendered.should.equal('woo bar');
        done();
      });
    });
  });

  describe('createSimpleTag', function() {
    it('should be exposed', function() {
      kiwi.tools.should.have.property('createSimpleTag');
    });
    
    it('should correctly define tags', function(done) {
      tools.createSimpleTag('cap', function(context, name) {
        return name.toUpperCase();
      });
      new kiwi.Template('{{cap "test"}}').render({}, function(err, rendered) {
        if(err) return done(err);
        rendered.should.equal('TEST');
        done();
      });
    });
    
    it('should escape markup by default', function(done) {
      tools.createSimpleTag('css', function(context, name) {
        return '<link rel="stylesheet" type="text/css" src="' + name + '">';
      });
      new kiwi.Template('{{css "file.css"}}').render({}, function(err, rendered) {
        if(err) return done(err);
        rendered.should.equal('&lt;link rel=&quot;stylesheet&quot; type=&quot;text/css&quot; src=&quot;file.css&quot;&gt;');
        done();
      });
    });
    
    it('should not escape safe markup', function(done) {
      tools.createSimpleTag('css', function(context, name) {
        return tools.safe('<link rel="stylesheet" type="text/css" src="' + name + '">');
      });
      new kiwi.Template('{{css "file.css"}}').render({}, function(err, rendered) {
        if(err) return done(err);
        rendered.should.equal('<link rel="stylesheet" type="text/css" src="file.css">');
        done();
      });
    });
    
    it('should work without argument', function(done) {
      tools.createSimpleTag('foo', function(context) {
        return 'bar';
      });
      new kiwi.Template('{{foo}}').render({}, function(err, rendered) {
        if(err) return done(err);
        rendered.should.equal('bar');
        done();
      });
    });
    
    it('should work with dynamic arguments', function(done) {
      tools.createSimpleTag('hello', function(context, name) {
        return 'Hello, ' + name;
      });
      new kiwi.Template('{{hello name}}').render({name: 'kiwi'}, function(err, rendered) {
        if(err) return done(err);
        rendered.should.equal('Hello, kiwi');
        done();
      });
    });
    
    it('should work with multiple arguments', function(done) {
      tools.createSimpleTag('hello', function(context, greeting, name) {
        return 'Hello, ' + greeting + ' ' + name;
      });
      new kiwi.Template('{{hello "dear" name}}').render({name: 'kiwi'}, function(err, rendered) {
        if(err) return done(err);
        rendered.should.equal('Hello, dear kiwi');
        done();
      });
    });
    
    it('should pass context to handler', function(done) {
      tools.createSimpleTag('foo', function(context) {
        context.name.should.equal('kiwi');
        context.name = 'woo';
        return 'bar';
      });
      new kiwi.Template('{{foo}} ${name}').render({name: 'kiwi'}, function(err, rendered) {
        if(err) return done(err);
        rendered.should.equal('bar woo');
        done();
      });
    });
  });
});