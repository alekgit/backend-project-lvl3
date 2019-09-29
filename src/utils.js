import path from 'path';

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

export {
  generateNameFromLocalLink,
  generateHtmlFileNameFromLink,
  generateResoursesFolderNameFromLink,
};
