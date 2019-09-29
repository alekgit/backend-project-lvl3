import path from 'path';
// import { URL } from 'url'; // -?-

import dropRight from 'lodash/dropRight'; // -?-

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

const generateUrlBaseFromLink = (link) => {
  const { origin, pathname } = new URL(link);
  const pn = dropRight(pathname.split('/').filter(p => p !== ''), 1).join('/');
  const { href } = new URL(pn, origin);
  return href;
};

export {
  generateNameFromLocalLink,
  generateHtmlFileNameFromLink,
  generateResoursesFolderNameFromLink,
  generateUrlBaseFromLink,
};
