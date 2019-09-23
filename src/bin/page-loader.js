#! /usr/bin/env node

import program from 'commander';
import { version } from '../../package.json';

import pageLoader from '..';

program
  .version(version)
  .option(
    '-o, --output <path>',
    'path to directory',
    process.cwd(),
  )
  .arguments('<link>')
  .action((link) => {
    pageLoader(link, program.output);
  })
  .parse(process.argv);
