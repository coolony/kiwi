# Kiwi


## What is this?

Kiwi is a cool JavaScript template engine lovingly built from the ground up for Node.js with performance, extensibility, modularity and security in mind. It is compatible with most of [jQuery Template](http://api.jquery.com/category/plugins/templates/) syntax, and adds lots of features to it. This means Kiwi is:

* **Fast**. Insanely fast.
* **Completely asynchronous**. You have the absolute guarantee that not a single blocking call will be done after Kiwi has been initialized.
* **Easily extensible**. Three short lines of code are enough to create a new tag.
* **Incredibly powerful**, even for advanced features. Want dynamic template inheritance? Access individual block contents? Done!
* **Easy to set up**. One line of code and you can get started on [Express](http://expressjs.com) 3.x. In most cases, you can even use your existing jQuery or [jqTpl](https://github.com/kof/node-jqtpl) templates without modification.
* **Robust**. Kiwi is carefully tested before any change is pushed to the repository.
* **Full-featured**. Lots of filters are available, and it can't be easier to add your own if you want.
* **Secure**. All output is escaped by default.
* **Clean**. Kiwi won't mess with your prototypes, and won't extend any of the built-in JavaScript objects.


As an additional feature, you can use Kiwi in client mode, with – almost – all features available, except for a few involving the file system (mainly `require` and `include`).


## Syntax example

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

### Loading a template from string

```javascript
var kiwi = require('kiwi');

var template = '<p>Hello, ${name}!</p>';
new kiwi.Template(template).render({name: "Kiwi"}, function onRendered(err, rendered) {
  console.log('Rendered template is: ' + rendered);
});
```

### Loading a template from disk

```javascript
var kiwi = require('kiwi');

var template = new kiwi.Template().loadFile('template.kiwi', function onLoaded(err) {
  template.render({name: "Kiwi"}, function onRendered(err, rendered) {
    console.log('Rendered template is: ' + rendered);
  });
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

The `${}` tag optionally supports filters.

```
// Template
<div>${a|replace('k', 'w')|capitalize}</div>

// Code
new Template(tpl).render({a: 'kiwi'}, callback);

// Result
<div>wiwi</div>
```

#### Escaping by default

The `${}` tag escapes its output by default.

```
// Template
<div>${a}</div>

// Code
new Template(tpl).render({a: '<b>kiwi</b>'}, callback);

// Result
<div>&lt;b&gt;kiwi&lt;/b&gt;</div>
```

You can optionally insert unescaped data by using the special `raw`filter.

```
// Template
<div>${a|raw}</div>

// Code
new Template(tpl).render({a: '<b>kiwi</b>'}, callback);

// Result
<div><b>kiwi</b></div>
```

### {{if}}

#### Basic usage

Used for conditional insertion of content. Renders the content between the opening and closing template tags only if the specified data item field, JavaScript function or expression does not evaluate to false (or to zero, null, type "undefined", or the empty string).

```
// Template
<div>{{if show}}Foo{{/if}}</div>
<div>{{if !show}}Bar{{/if}}</div>

// Code
new Template(tpl).render({show:true}, callback);

// Result
<div>Foo</div>
<div></div>
```

#### Alternatives

`{{else}}` can be used in association with the `{{if}}` tag to provide alternative content based on the values of one or more expressions. The `{{else}}` tag can be used without a parameter, as in `{{if a}}...{{else}}...{{/if}}`, or with a parameter, as in `{{if a}}...{{else b}}...{{/if}}`.

```
// Template
<div>{{if a === 2}}Moo{{else b === 3}}Foo{{else}}Kiwi{{/if}}</div>

// Code
new Template(tpl).render({a: 1, b: 2}, callback);

// Result
<div>Kiwi</div>
```

### {{each}}

#### Basic usage

Used to iterate over a data array, and render the content between the opening and closing template tags once for each data item.

```
// Template
<ul>
{{each movies}}
  <li>${$index|incr}. ${$value}</li>
{{/each}}
</ul>

// Code
new Template(tpl).render({movies: ['Meet Joe Black', 'City Hunter']}, callback);

// Result
<ul>
  <li>1. Meet Joe Black</li>
  <li>2. City Hunter</li>
</ul>
```

#### Index and parameter support

The block of template markup between the opening and closing tags `{{each}}` and `{{/each}}` is rendered once for each data item in the data array. Within this block the `{{each}}` template tag exposes the current index and value as additional template variables $index and $value. These default variable names can be changed by passing in index and value parameters to the `{{each}}` template tag, as in the following example:

```
// Template
<ul>
{{each(i, name) movies}}
  <li>${i|incr}. ${name}</li>
{{/each}}
</ul>

// Code
new Template(tpl).render({movies: ['Meet Joe Black', 'City Hunter']}, callback);

// Result
<ul>
  <li>1. Meet Joe Black</li>
  <li>2. City Hunter</li>
</ul>
```

#### Loop counters

By default, Kiwi sets a number of variables available within the loop:

* **_eachLoop.size**: The number of items in the collection
* **_eachLoop.counter**: The current iteration of the loop (1-indexed)
* **_eachLoop.counter0**: The current iteration of the loop (0-indexed)
* **_eachLoop.revcounter**: The number of iterations from the end of the loop (1-indexed)
* **_eachLoop.revcounter0**: The number of iterations from the end of the loop (0-indexed)
* **_eachLoop.first**: `true` if this is the first time through the loop
* **_eachLoop.last**: `true` if this is the last time through the loop
* **_eachLoop.parentLoop**: For nested loops, this is the loop "above" the current one

```
// Template
<ul>
{{each(i, name) movies}}
  <li>${_eachLoop.counter}. ${name}</li>
{{/each}}
</ul>

// Code
new Template(tpl).render({movies: ['Meet Joe Black', 'City Hunter']}, callback);

// Result
<ul>
  <li>1. Meet Joe Black</li>
  <li>2. City Hunter</li>
</ul>
```

#### Empty clause

The `{{each}}` tag can take an optional `{{ empty }}` clause that will be displayed if the given collection is empty:

```
// Template
<ul>
{{each(i, name) movies}}
  <li>${name}</li>
{{empty}}
  <li>No movies found…</li>
{{/each}}
</ul>

// Code
new Template(tpl).render({movies: []}, callback);

// Result
<ul>
  <li>No movies found…</li>
</ul>
```

### {{tmpl}}

Used for composition of templates. Renders a nested template from a string within the rendered output of the parent template.

```
// Template
<div>{{tmpl nested}}</div>

// Code
new Template(tpl).render({nested: '${a}', a: 'Kiwi'}, callback);

// Result
<div>Kiwi</div>
```

### {{include}}

Used for composition of templates. Loads a nested template from disk and renders it within the rendered output of the parent template.

```
// foo.kiwi
Hello!

// Template
<div>{{include "foo"}}</div>

// Code
new Template(tpl).render({}, callback);

// Result
<div>Hello!</div>
```

### {{block}}

Used to set separate blocks in your template. This can be used to extract specific portions of your template after rendering, or in combination with `{{extend}}` tag:

```
// Template
<div>{{block foo}}Kiwi{{/block}}</div>

// Code
new Template(tpl).render({}, function(err, rendered) {
  console.log('Result:', rendered);
  console.log('Foo:', rendered.blocks['foo']);
});

// Result
Result: <div>Kiwi</div>
Foo: Kiwi
```

### {{extend}}

Makes the current template extend another template loaded from disk.

```
// foo.kiwi
Hello, {{block foo}}world{{/block}}!

// Template
{{extend "foo"}}
{{block foo}}kiwi{{/block}}

// Code
new Template(tpl).render({}, callback);

// Result
<div>Hello, kiwi!</div>
```

### {{raw}}

The compiler won't anything between `{{raw}}` and `{{/raw}}`. This can be useful if you want some parts of your template to be rendered on the client.

For better compatibility with jqTpl, `{{verbatim}}` is an alias for `{{raw}}`.

```
// Template
<div>{{raw}}${a}{{/raw}}</div>

// Code
new Template(tpl).render({}, callback);

// Result
<div>${a}</div>
```

### {{#}} and {{comment}}

These tags are comments, which are never rendered.

```
// Template
{{# Some comment}}Kiwi{{comment}}Some other comment{{/comment}}

// Code
new Template(tpl).render({}, callback);

// Result
Kiwi
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
* incr
* decr
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


## Express 3.x compatibility

Kiwi works out of the box with [Express](http://expressjs.com) 3.x. Here is a (very) basic example:

```javascript
var express = require('express');
var app = express.createServer();

app.set('view engine', 'kiwi');

app.get('/', function(req, res) {
  res.render('index', {});
});

app.listen(3000);
```


## Extensibility

### Create tags

Did we say that Kiwi was extensible with no more than 3 lines of code? Well, we didn't lie. For example, say you want to create a new tag `{{cap}}` which will capitalize its argument. Here is the only thing you'd need to do:

```javascript
kiwi.tools.createSimpleTag('cap', function(context, name) {
  return name.toUpperCase();
});
```

You can then use your new tag as any other:

```
// Template
<div>{{cap "kiwi"}}</div>

// Code
new Template(tpl).render({}, callback);

// Result
<div>KIWI</div>
```

For better security, just like with the `${}` tag, all output of custom tags defined that way is escaped by default. If you want your tag to input raw HTML in your document, you can mark the output as safe. For example, let's say you want to create a `{{css}}` tag which will render a `<link>` tag in your document:

```javascript
kiwi.tools.createSimpleTag('css', function(context, name) {
  return kiwi.tools.safe('<link rel="stylesheet" type="text/css" src="' + name + '">');
});
```

It's as simple as that.

### Create filters

You can also create new filters with the same awsomeness. Let's say you want to create a new `prepend` filter. Three lines are enough:

```javascript
kiwi.tools.createFilter('prepend', function(str, thing) {
  return thing + str;
});
```

You can then use your new filter as any other:

```
// Template
<div>${name|prepend("Hello, ")}</div>

// Code
new Template(tpl).render({name: 'Kiwi'}, callback);

// Result
<div>Hello, Kiwi</div>
```


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
