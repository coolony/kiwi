SRC = $(shell find ./lib -name "*.js" -type f)
UGLIFY = $(shell find node_modules -name "uglifyjs" -type f)
JSHINT = $(shell find ./node_modules -type l -name "jshint")

all: kiwi.min.js

test:
	@./node_modules/.bin/mocha

kiwi.js: $(SRC)
	@node support/compile.js $^

kiwi.min.js: kiwi.js
	@$(UGLIFY) $< > $@ \
		&& rm -f /tmp/kiwi.min.js \
		&& cat support/license.min.js > /tmp/kiwi.min.js \
		&& echo "" >> /tmp/kiwi.min.js \
		&& cat kiwi.min.js >> /tmp/kiwi.min.js \
		&& mv /tmp/kiwi.min.js . \
		&& du kiwi.min.js \
		&& du kiwi.js

lint:
	@$(JSHINT) $(SRC)

.PHONY: test lint