import { promises as fs, constants } from 'fs';
import { URL } from 'url';
import path from 'path';

import axios from 'axios';
import cheerio from 'cheerio';
import dropRight from 'lodash/dropRight'; // -?-
import zipWith from 'lodash/zipWith'; // -?-
import isRelativeUrl from 'is-relative-url';

const generateNameFromLocalLink = (localLink) => {
  const separator = /\//;
  const { dir, base } = path.parse(localLink);
  const dirParts = dir.split(separator)
    .filter(part => part.trim() !== '');
  const res = [...dirParts, base].join('-');
  return res;
};

const generateNameFromLink = (link, nameSuffix = '') => {
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

const ch = (node, dom, p, attr) => dom(node).attr(attr, p);

let inner;

const t = {
  link: {
    attr: 'href',
    predicate(node, dom) {
      return isRelativeUrl(dom(node).attr(this.attr));
    },
    getRelativeUrl(node, dom) {
      return dom(node).attr(this.attr);
    },
    change(node, dom, p) {
      return ch(node, dom, p, this.attr);
    },
  },
  img: {
    attr: 'src',
    predicate(node, dom) {
      return isRelativeUrl(dom(node).attr(this.attr));
    },
    getRelativeUrl(node, dom) {
      return dom(node).attr(this.attr);
    },
    change(node, dom, p) {
      return ch(node, dom, p, this.attr);
    },
  },
  script: {
    attr: 'src',
    predicate(node, dom) {
      return isRelativeUrl(dom(node).attr(this.attr));
    },
    getRelativeUrl(node, dom) {
      return dom(node).attr(this.attr);
    },
    change(node, dom, p) {
      return ch(node, dom, p, this.attr);
    },
  },
};

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
            resourse.content = resourseContent;
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
      const arrForWrite = inner.map(node => fs.writeFile(node.absolutePath, node.content));
      const promise = Promise.all(arrForWrite);
      return promise;
    })
    .catch((e) => {
      console.log(e);
      throw e;
    });
};

export default pageLoader;
