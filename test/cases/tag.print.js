/*!
 * Coolony's Kiwi
 * Copyright ©2012 Pierre Matri <pierre.matri@coolony.com>
 * MIT Licensed
 */


var should = require('should');
var Template = require('../../lib/template');
var moment = require('moment');

describe('Filter', function() {
  describe('datetime', function() {
    it('`timeago` should render same thing as `moment#fromNow`', function(done) {
      var date = new Date();
      new Template('${date|timeago}').render({date: date}, function onRendered(err, rendered) {
        should.not.exist(err);
        rendered.should.equal(moment(date).fromNow());
        done();
      });
    });

    it('`relativedate` should render same thing as `moment#calendar`', function(done) {
      var date = new Date();
      new Template('${date|relativedate}').render({date: date}, function onRendered(err, rendered) {
        should.not.exist(err);
        rendered.should.equal(moment(date).calendar());
        done();
      });
    });
  });
  
  it('should trow an helpful error when an invalid filter name is used', function(done) {
    new Template('${name|foo@bar}').render({}, function onRendered(err, rendered) {
      err.message.should.equal('Compilation error: Unable to parse filter `foo@bar`.');
      done();
    });
  });
});