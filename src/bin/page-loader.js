#! /usr/bin/env node

import { promises as fs } from 'fs';
import url from 'url';
import path from 'path';

import program from 'commander';
import axios from 'axios';
import { version } from '../../package.json';

// const link = 'http://www.brainjar.com/java/host/test.html';

program
  .version(version)
  .option('-o, --output <path>', 'path to output file', process.cwd())
  .arguments('<link>')
  .action((link) => {
    console.log('!!!!!!!!!!!!');
    axios.get(link)
      .then(({ data }) => {
        const myUrl = new URL(link);
        const { hostname, pathname } = myUrl;
        const separator = /\W/;
        const parts = [
          ...hostname.split(separator),
          ...pathname.split(separator),
        ].filter(part => part.trim() !== '');
        const nameBody = parts.join('-');
        const nameSuffix = '.html';
        const name = `${nameBody}${nameSuffix}`;
        const pathToFile = path.join(program.output, name);
        console.log(pathToFile);
        // console.log(data); // console.log(program);
        // fs.writeFile(pathToFile, data);
      });
  })
  .parse(process.argv);
