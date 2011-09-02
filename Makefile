all: test

unittests:
	expresso -g test/unit/test_*.js
	expresso -g test/unit_isolated/test_*.js

functionaltests:
	expresso -g test/functional/test_*.js

test: unittests functionaltests

.PHONY: test