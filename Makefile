install: install-deps

run:
	npx babel-node src/bin/page-loader.js --output ./tmp http://www.brainjar.com/java/host/test.html

run_default:
	npx babel-node src/bin/page-loader.js

install-deps:
	npm install

build:
	rm -rf dist
	npm run build

test:
	npm test

lint:
	npx eslint .

publish:
	npm publish --dry-run
	npm unlink
	npm link
