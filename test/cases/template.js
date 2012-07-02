/*!
 * Coolony's Kiwi
 * Copyright ©2012 Pierre Matri <pierre.matri@coolony.com>
 * MIT Licensed
 */


var should = require('should');
var Template = require('../../lib/template');

describe('Template', function() {
  describe('constructor', function() {
    it('should be initializable with no arguments', function() {
      new Template().should.be.an.instanceof(Template);
    });

    it('should be initializable with only options', function() {
      new Template({foo:'bar'}).options.foo.should.equal('bar');
    });

    it('should be initializable with only a template', function() {
      new Template('foo').template.should.equal('foo');
    });

    it('should be initializable with both a template string and options', function() {
      var template = new Template('foo', {foo:'bar'});
      template.options.foo.should.equal('bar');
      template.template.should.equal('foo');
    });

    it('should initialize cache', function() {
      var template = new Template({cache:true});
      template._getCache().should.be.an.instanceof(template.options.cacheHandler);
    });

    it('should override `cacheHandler`', function() {
      function Dummy() {}
      var template = new Template({cache:true, cacheHandler: Dummy});
      template._getCache().should.be.an.instanceof(Dummy);
    });

    it('should pass `cacheOptions` to `cacheHandler`', function() {
      function Dummy(foo, bar) {
        this.foo = foo;
        this.bar = bar;
      }
      var template = new Template({cache:true,
                                   cacheHandler: Dummy,
                                   cacheOptions: ['a', 'b']});
      template._getCache().foo.should.equal('a');
      template._getCache().bar.should.equal('b');
    });
  });


  describe('#loadFile', function() {
    var template;

    beforeEach(function() {
      template = new Template();
    });

    it('should load template', function(done) {
      template.loadFile(__dirname + '/../fixtures/hello.kiwi', function(err) {
        template.template.should.equal('<p class="hello">Hello ${name}!</p>');
        done();
      });
    });

    it('should return an error when the file doesn\'t exist', function(done) {
      template.loadFile(__dirname + '/../fixtures/goodbye.kiwi', function(err) {
        should.exist(err);
        done();
      });
    });

    it('should be overridable with `load`', function(done) {
      template = new Template({load: function(path, callback){
        callback(null, 'foo');
      }})
      template.loadFile('kiwiiiiii', function(err) {
        template.template.should.equal('foo');
        done();
      });
    });

    it('should delegate error handling to `load` function', function(done) {
      template = new Template({load: function(path, callback){
        callback('bar');
      }})
      template.loadFile('kiwiiiiii', function(err) {
        err.should.equal('bar');
        done();
      });
    });
  });

  describe('#render', function() {
    it('should render loaded template', function(done) {
      var template = new Template();
      template.loadFile(__dirname + '/../fixtures/hello.kiwi', function(err, data) {
        template.render({name: 'Kiwi'}, function(err, compiled) {
          if(err) throw err;
          compiled.should.equal('<p class="hello">Hello Kiwi!</p>');
          done();
        });
      });
    });

    it('should render static template', function(done) {
      var template = new Template('foo ${name} bar');
      template.render({name: 'Kiwi'}, function(err, compiled) {
        if(err) throw err;
        compiled.should.equal('foo Kiwi bar');
        done();
      });
    });
  });
  
  describe('#loadAndRender', function() {
    it('should load and render template', function(done) {
      var template = new Template();
      template.loadAndRender(__dirname + '/../fixtures/hello.kiwi', {name: 'Kiwi'}, function(err, compiled) {
        if(err) throw err;
        compiled.should.equal('<p class="hello">Hello Kiwi!</p>');
        done();
      });
    });
  });
  
  describe('lookup', function() {
    var template;

    beforeEach(function() {
      template = new Template({cache:false});
    });

    it('should delegate lookup correctly', function(done) {
      var calls = 0;
    
      function lookup(name, template, callback) {
        calls++;
        callback(null, __dirname + '/../fixtures/root.kiwi');
      }
      
      function onLoaded(err, data) {
        should.not.exist(err);
        calls.should.equal(0);
        template.render({}, onRendered);
      }
      
      function onRendered(err, callback) {
        should.not.exist(err);
        calls.should.equal(1);
        done();
      }
    
      template.options.lookup = lookup;
      template.loadFile(__dirname + '/../fixtures/intermediate.kiwi', onLoaded);
    });
    
    it('should delegate lookup error to hander', function(done) {
      function lookup(name, template, callback) {
        callback(new Error('Something went wrong...'));
      }
      
      function onLoaded(err, data) {
        should.not.exist(err);
        template.render({}, onRendered);
      }
      
      function onRendered(err, callback) {
        should.exist(err);
        err.message.should.equal('Something went wrong...')
        done();
      }
    
      template.options.lookup = lookup;
      template.loadFile(__dirname + '/../fixtures/intermediate.kiwi', onLoaded);
    });
  });
});
