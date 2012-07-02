# Kiwi's History

## Head

### New fratures

* Added client-side support.
* Added `ifblock` tag.
* Added `as` tag.
* Added new `lookupPaths` configuration option to add flexibility in nesting templates.
* Added support for block append and prepend.
* Added experimental `parent` tag.
* Added compatibility with node 0.8.x
* Dropped support for node < 0.6.x


### Improvements

* Various performance improvements.


### Bug fixes

* Corrected a bug that prevented Express' `view options` to be correctly passed to Kiwi.
* Fixed rendering exception handling, which could cause Express to crash in certain conditions.
* Fixed a bug that could prevent cache to work properly in certain conditions.
* Corrected documentation.


## 0.1.2

* Added `createSimpleTag` and `createFilter` functions to help extending Kiwi.