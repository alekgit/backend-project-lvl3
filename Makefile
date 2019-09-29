install: install-deps

run:
	rm -rf ./tmp/results/
	mkdir ./tmp/results/
	DEBUG='page-loader,page-loder:*' npx babel-node src/bin/page-loader.js --output ./tmp/results http://www.brainjar.com/java/host/test.html

run_default:
	npx babel-node src/bin/page-loader.js

install-deps:
	npm install

build:
	rm -rf dist
	npm run build

test:
	npm test

watch-test:
	DEBUG='page-loader,page-loader:*' npx jest --watch -o

test-coverage:
	npm test -- --coverage

lint:
	npx eslint .

publish:
	npm publish --dry-run
	npm unlink
	npm link
