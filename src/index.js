import { promises as fs, constants } from 'fs';
import { URL } from 'url';
import path from 'path';

import axios from 'axios';
import cheerio from 'cheerio';
import dropRight from 'lodash/dropRight'; // -?-
import zipWith from 'lodash/zipWith'; // -?-

import {
  generateNameFromLocalLink,
  generateHtmlFileNameFromLink,
  generateResoursesFolderNameFromLink,
} from './utils';

import t from './dispatchMap';

let inner;

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

      const { origin, pathname } = new URL(link);
      const pn = dropRight(pathname.split('/').filter(p => p !== ''), 1).join('/');
      const newUrl = new URL(pn, origin);
      const { href: urlBase } = newUrl;
      const absoluteUrls = relativeUrls.map((p) => {
        const url = [urlBase, p].join('/');
        return url;
      });

      inner = zipWith(
        filteredHtmlNodes, absoluteUrls, absolutePaths, relativePaths,
        (
          htmlNode, absoluteUrl, absolutePath, relativePath,
        ) => ({
          htmlNode, absoluteUrl, absolutePath, relativePath,
        }),
      );

      const resoursesContent = inner.map(
        resourse => axios.get(resourse.absoluteUrl)
          .then(({ data: resourseContent }) => {
            resourse.content = resourseContent; // -?-
            return resourseContent;
          }),
      );

      inner.forEach(({ htmlNode, relativePath }) => {
        t[htmlNode.name].change(htmlNode, $, relativePath);
      });

      const htmlFileName = generateHtmlFileNameFromLink(link);
      const absolutePathToHtmlFile = path.join(outputDir, htmlFileName);
      inner.push({
        htmlNode: $('root'), // -?-
        absoluteUrl: link,
        absolutePath: absolutePathToHtmlFile,
        content: $.html(),
      });

      const promise = Promise.all(resoursesContent);
      return promise;
    })
    .then(() => {
      const writeFilePromises = inner.map(node => fs.writeFile(node.absolutePath, node.content));
      const promise = Promise.all(writeFilePromises);
      return promise;
    })
    .catch((e) => {
      console.log(e);
      throw e;
    });
};

export default pageLoader;
