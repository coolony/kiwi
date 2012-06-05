/*!
 * Coolony's Kiwi
 * Copyright ©2012 Pierre Matri <pierre.matri@coolony.com>
 * MIT Licensed
 */


/*
 * Module dependencies
 */

var kiwi = require('../');
var tools = kiwi.tools;
var fs = require('fs');
var basename = require('path').basename;
var should = require('should');


/**
 * Constants
 */

var TEST_DATA = {
  t: true,
  f: false,
  n: null,
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  name: 'kiwi',
  nameUpper: 'KIWI',
  html: '<p>kiwi</p>',
  html2: '<p class="moo">kiwi</p>',
  html3: '<p class=\'moo\'>kiwi</p>',
  safeHtml: tools.safe('<p class="moo">kiwi</p>'),
  objt: {foo:'bar'},
  objm: {foo:'bar', woo:'loo'},
  objn: {foo:10},
  arr: ['first', 'second'],
  date: new Date(),
  oldDate: new Date("October 13, 1975 11:13:00"),
  float1: 5.32,
  float2: 8.87,
  tpl: '<p class="foo">${name}</p>',
  emptyArr: []
}


/*
 * List tests
 */

var files = fs.readdirSync('test/cases');
var cases = [];
files.forEach(function(file) {
  file = __dirname + '/cases/' + file;
  if(file.slice(-5) === '.kiwi') cases.push(file.slice(0, -5));
  if(file.slice(-3) === '.js') require(file.slice(0, -3));
});


/*
 * Run them
 */

cases.forEach(function(path) {
  it(basename(path), function(done){
    var templatePath = path + '.kiwi';
    var html = fs.readFileSync(path + '.html', 'utf-8').trim();
    var template = new kiwi.Template({cache: false});

    function onLoaded(err, data) {
      template.render(TEST_DATA, onRendered)
    }

    function onRendered(err, rendered) {
      rendered.trim().should.equal(html);
      done(err);
    }

    template.loadFile(templatePath, onLoaded);
  })
});
