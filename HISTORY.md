# Kiwi's History

## 0.2.0

### New features

* Default view lookup function now looks for template paths relative to `process.cwd()`.
* `extend` and `include` tag now support a Template instance as argument, and thus, are made available in client mode.

### Improvements

* Added JSLint testing.

### Other changes

* Internal variable name changes.
* `_eachLoop` is now `$each`.

## 0.1.3

### New fratures

* Added client-side support.
* Added `ifblock` tag.
* Added `as` tag.
* Added new `lookupPaths` configuration option to add flexibility in nesting templates.
* Added support for block append and prepend.
* Added `parent` tag.
* Added `Template#loadAndRender` shortcut

### Improvements

* Various performance improvements.

### Compatibility

* Added compatibility with node 0.8.x.
* Dropped support for node < 0.6.x.
* `Template#load` doesn't invoke callback with raw loaded file data anymore.

### Bug fixes

* Corrected a bug that prevented Express' `view options` to be correctly passed to Kiwi.
* Fixed rendering exception handling, which could cause Express to crash in certain conditions.
* Fixed a bug that could prevent cache to work properly in certain conditions.
* Corrected documentation.


## 0.1.2

* Added `createSimpleTag` and `createFilter` functions to help extending Kiwi.