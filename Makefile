SRC = $(shell find lib -name "*.js" -type f)
UGLIFY = $(shell find node_modules -name "uglifyjs" -type f)
UGLIFY_FLAGS = --no-mangle

all: kiwi.min.js

test:
	@./node_modules/.bin/mocha
	
kiwi.js: $(SRC)
	@node support/compile.js $^

kiwi.min.js: kiwi.js
	@$(UGLIFY) $(UGLIFY_FLAGS) $< > $@ \
		&& du kiwi.min.js \
		&& du kiwi.js

.PHONY: test