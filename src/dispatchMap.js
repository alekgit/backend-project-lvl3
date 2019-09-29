import isRelativeUrl from 'is-relative-url';
import debug from 'debug';

const d = debug('page-loader:dispatchMap');
d('initializing...');

function predicate(node, dom) {
  return isRelativeUrl(dom(node).attr(this.attr));
}

function getRelativeUrl(node, dom) {
  return dom(node).attr(this.attr);
}

function setRelativePathToAttr(node, dom, p) {
  return dom(node).attr(this.attr, p);
}

// -?- знает о cheerio
export default {
  link: {
    attr: 'href',
    predicate,
    getRelativeUrl,
    setRelativePathToAttr,
  },
  img: {
    attr: 'src',
    predicate,
    getRelativeUrl,
    setRelativePathToAttr,
  },
  script: {
    attr: 'src',
    predicate,
    getRelativeUrl,
    setRelativePathToAttr,
  },
};

d('done!');
