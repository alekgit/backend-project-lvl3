#! /usr/bin/env node

import program from 'commander';

// import { version } from '../package.json';

program
  .option('-o, --output <path>', 'path to output file', __dirname)
  .parse(process.argv);

console.log(`output path: ${program.output}`);
// console.log(program);
