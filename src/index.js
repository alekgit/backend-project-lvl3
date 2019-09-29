import { promises as fs, constants } from 'fs';
import path from 'path';

import axios from 'axios';
import cheerio from 'cheerio';
import zipWith from 'lodash/zipWith'; // -?-

import {
  generateNameFromLocalLink,
  generateHtmlFileNameFromLink,
  generateResoursesFolderNameFromLink,
  generateUrlBaseFromLink,
} from './utils';

import t from './dispatchMap'; // -?-

let nodes;

const pageLoader = async (link, outputDir) => {
  const resoursesFolderName = generateResoursesFolderNameFromLink(link);
  const pathToResoursesFolder = path.join(outputDir, resoursesFolderName);
  return fs.access(pathToResoursesFolder, constants.F_OK)
    .catch(() => fs.mkdir(pathToResoursesFolder))
    .then(() => axios.get(link))
    .then(({ data: mainHtmlPageContent }) => {
      const $ = cheerio.load(mainHtmlPageContent);

      const filteredHtmlNodes = $(Object.keys(t).join(','))
        .filter((_i, elem) => t[elem.name].predicate(elem, $));
      const relativeUrls = filteredHtmlNodes
        .map((_i, elem) => t[elem.name].getRelativeUrl(elem, $)).get();
      const localNames = relativeUrls.map(generateNameFromLocalLink);
      const relativePaths = localNames.map(name => path.join(resoursesFolderName, name));
      const absolutePaths = relativePaths.map(relativePath => path.join(outputDir, relativePath));
      const urlBase = generateUrlBaseFromLink(link);
      const absoluteUrls = relativeUrls.map(p => [urlBase, p].join('/'));

      nodes = zipWith(
        filteredHtmlNodes, absoluteUrls, absolutePaths, relativePaths,
        (
          htmlNode, absoluteUrl, absolutePath, relativePath,
        ) => ({
          htmlNode, absoluteUrl, absolutePath, relativePath,
        }),
      );

      const resoursesContentPromises = nodes.map(
        resourse => axios.get(resourse.absoluteUrl)
          .then(({ data: resourseContent }) => { // -?-
            resourse.content = resourseContent; // eslint-disable-line no-param-reassign
          }),
      );

      nodes.forEach(({ htmlNode, relativePath }) => {
        t[htmlNode.name].setRelativePathToAttr(htmlNode, $, relativePath);
      });

      const htmlFileName = generateHtmlFileNameFromLink(link);
      const absolutePathToHtmlFile = path.join(outputDir, htmlFileName);
      nodes.push({
        htmlNode: $('root'), // -?-
        absoluteUrl: link,
        absolutePath: absolutePathToHtmlFile,
        content: $.html(),
      });

      return Promise.all(resoursesContentPromises);
    })
    .then(() => {
      const writeFilePromises = nodes.map(node => fs.writeFile(node.absolutePath, node.content));
      return Promise.all(writeFilePromises);
    })
    .catch((e) => {
      throw e;
    });
};

export default pageLoader;
