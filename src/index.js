import { promises as fs } from 'fs';
import { URL } from 'url';
import path from 'path';

import axios from 'axios';

// const getBasename = line => path.basename(line, path.extname(line));

const generateNameFromLink = (link, nameSuffix = '') => {
  // const { dir, name, ext } = path.parse(nameBody);
  const url = new URL(link);
  const { hostname, pathname } = url;
  const separator = /\W/;
  const parts = [
    ...hostname.split(separator),
    ...pathname.split(separator),
  ].filter(part => part.trim() !== '');
  const nameBody = parts.join('-');
  const result = `${nameBody}${nameSuffix}`;
  return result;
};

const generateHtmlFileNameFromLink = (link) => {
  const nameSuffix = '.html';
  return generateNameFromLink(link, nameSuffix);
};

const generateResoursesFolderNameFromLink = (link) => {
  const nameSuffix = '_files';
  return generateNameFromLink(link, nameSuffix);
};

const pageLoader = (link, outputDir) => axios.get(link)
  .then(({ data }) => {
    const htmlFileName = generateHtmlFileNameFromLink(link);
    const resoursesFolderName = generateResoursesFolderNameFromLink(link);
    const pathToFile = path.join(outputDir, htmlFileName);
    return fs.writeFile(pathToFile, data); // ?
  });

export default pageLoader;
