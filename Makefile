install: install-deps

run:
	npx babel-node src/bin/page-loader.js --output /var/tmp

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
