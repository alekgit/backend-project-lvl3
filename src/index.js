import { promises as fs, constants } from 'fs';
import path from 'path';

import axios from 'axios';
import cheerio from 'cheerio';
import zipWith from 'lodash/zipWith'; // -?-
import debug from 'debug';

import {
  generateNameFromLocalLink,
  generateHtmlFileNameFromLink,
  generateResoursesFolderNameFromLink,
  generateUrlBaseFromLink,
} from './utils';

import t from './dispatchMap'; // -?-

const d = debug('page-loader');

let nodes;

const pageLoader = async (link, outputDir) => {
  d('making resourse directory...');
  const resoursesFolderName = generateResoursesFolderNameFromLink(link);
  const pathToResoursesFolder = path.join(outputDir, resoursesFolderName);
  return fs.access(pathToResoursesFolder, constants.F_OK)
    .catch(() => fs.mkdir(pathToResoursesFolder))
    .then(() => axios.get(link))
    .then(({ data: mainHtmlPageContent }) => {
      d('got html!');
      const $ = cheerio.load(mainHtmlPageContent);

      d('preparing nodes...');
      const filteredTags = $(Object.keys(t).join(','))
        .filter((_i, elem) => t[elem.name].predicate(elem, $));
      const relativeUrls = filteredTags
        .map((_i, elem) => t[elem.name].getRelativeUrl(elem, $)).get();
      const localNames = relativeUrls.map(generateNameFromLocalLink);
      const relativePaths = localNames.map((name) => path.join(resoursesFolderName, name));
      const absolutePaths = relativePaths.map((relativePath) => path.join(outputDir, relativePath));
      const urlBase = generateUrlBaseFromLink(link);
      const absoluteUrls = relativeUrls.map((p) => [urlBase, p].join('/'));

      nodes = zipWith(
        filteredTags, absoluteUrls, absolutePaths, relativePaths,
        (
          htmlNode, absoluteUrl, absolutePath, relativePath,
        ) => ({
          htmlNode, absoluteUrl, absolutePath, relativePath,
        }),
      );

      d('getting resourses content...');
      const resoursesContentPromises = nodes.map(
        (resourse) => axios.get(resourse.absoluteUrl)
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
      d('creating files...');
      const writeFilePromises = nodes.map((node) => fs.writeFile(node.absolutePath, node.content));
      return Promise.all(writeFilePromises);
    })
    .catch((e) => {
      throw e;
    });
};

export default pageLoader;
