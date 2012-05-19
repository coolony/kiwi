# Kiwi

## What is this?

Kiwi is a cool JavaScript template engine lovingly built from the ground up for Node.js with performance, extensibility, modularity and security in mind. It is compatible with most of [jQuery templates](http://api.jquery.com/category/plugins/templates/) syntax, and adds lots of features to it. This means Kiwi is:

* **Fast**. Insanely fast.
* **Completely asynchronous**. You have the absolute guarantee that not a single blocking call will be done after Kiwi has been initialized.
* **Easily extensible**. Three short lines of code are enough to create a new tag.
* **Incredibly powerful**, even for advanced features. Want dynamic template inheritance? Access individual block contents? Done!
* **Easy to set up**. One line of code and you can get started on [Express](http://expressjs.com) 3.x. You can even directly use your existing jQuery or [jqTpl](https://github.com/kof/node-jqtpl) templates.
* **Robust**. Kiwi is carefully tested before any change is pushed to the repository.
* **Full-featured**. Lots of filters are available, and it can't be easier to add your own if you want.
* **Secure**. All output is escaped by default.
* **Clean**. Kiwi won't mess with your prototypes, and won't extend any of the built-in JavaScript objects

## Syntax

```html
<!DOCTYPE html>
<html>
  <head>
    <title>${title}</title>
  </head>
  <body>
    <p>
      {{if name}}
        Hello, ${name|capitalize}!
      {{else}}
        Hello, dear unknown!
      {{/if}}
    </p>
  </body>
</html>
```

## Installation

### Latest release

```bash
npm install kiwi
```

### Development version (may not be suited for production [yet])

```bash
npm install https://github.com/coolony/kiwi/tarball/master
```

## Usage

```javascript
var kiwi = require('kiwi');

var template = '<p>Hello, ${name}!</p>';
new kiwi.Template(template).render({name: "Kiwi"}, function onRendered(err, rendered) {
  console.log('Rendered template is: ' + rendered);
});
```

## Available tags

### ${}

#### Basic usage

The `${varOrExpression}` tag inserts the value of `varOrExpression` in the template. This is a shortcut for `{{= varOrExpression}}`.

```
// Template
<div>${a}</div>
<div>{{= a}}</div>

// Code
new Template(tpl).render({a: 'kiwi'}, callback);

// Result
<div>kiwi</div>
<div>kiwi</div>
```

#### Filter support

The `${}` tag optionally supports filters. This is an addition to jQuery Templates syntax.

```
// Template
<div>${a|replace('k', 'w')|capitalize}</div>

// Code
new Template(tpl).render({a: 'kiwi'}, callback);

// Result
<div>wiwi</div>
```

## Available filters

* escape
* capitalize
* upper
* lower
* json
* add
* subtract
* mul
* div
* cut
* addslashes
* stripslashes
* first
* last
* length
* reverse
* join
* urlencode
* urldecode
* replace
* date
* relativedate
* timeago

## Performance tips

* **Use cache in production**
* **Use strict mode**  
You can disable strict mode in order to make Kiwi comply with jQuery template / jqTpl behaviour. However, this will result in using a bunch of `try…catch` blocks in the compiled templates, which will definitely lower Kiwi's performance.   
Strict mode is enabled by default.
* **Avoid using `tmpl`**   
In order to avoid memory leaks when using heavily dynamic templates in `tmpl`, this tag uses `CappedCache` by default, isolated from the main cache. As a result, if your nested templates are heavily dynamic, a new complete compiler stack is likely to be started each time a `tmpl` tag is met.   
You may choose to use a standard cache instead, but be aware that this could easily lead to huge memory leaks if your nested templates are heavily dynamic.   
It is included for compatibility with jQuery templates / jqTpl, but you should probably not use it at all.
* **Consider disabling `eachLoopCounters`**   
Kiwi adds counters to `each` loop, which allows you, for example, to access the current iteration count with `_eachLoop.counter`. If you don't need this functionality, disabling it will slightly increase Kiwi's performance when using `each` loops.


## License

**Kiwi is released under an MIT license**

Copyright ©2012 Pierre Matri <pierre.matri@coolony.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.