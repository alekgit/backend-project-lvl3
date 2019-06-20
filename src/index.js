import { promises as fs } from 'fs';
import { URL } from 'url';
import path from 'path';

import axios from 'axios';

// const getBasename = line => path.basename(line, path.extname(line));

const generateNameFromLink = (link) => {
  // const { dir, name, ext } = path.parse(nameBody);


  const url = new URL(link);
  const { hostname, pathname } = url;
  const separator = /\W/;
  const parts = [
    ...hostname.split(separator),
    ...pathname.split(separator),
  ].filter(part => part.trim() !== '');
  const nameBody = parts.join('-');
  const nameSuffix = '.html';
  const result = `${nameBody}${nameSuffix}`;
  return result;
};

const pageLoader = (link, outputDir) => axios.get(link)
  .then(({ data }) => {
    const name = generateNameFromLink(link);
    const pathToFile = path.join(outputDir, name);
    return fs.writeFile(pathToFile, data); // ?
  });

export default pageLoader;
