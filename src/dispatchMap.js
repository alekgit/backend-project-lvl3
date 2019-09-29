import isRelativeUrl from 'is-relative-url';

function predicate(node, dom) {
  return isRelativeUrl(dom(node).attr(this.attr));
}

function getRelativeUrl(node, dom) {
  return dom(node).attr(this.attr);
}

function change(node, dom, p) {
  return dom(node).attr(this.attr, p);
}

export default {
  link: {
    attr: 'href',
    predicate,
    getRelativeUrl,
    change,
  },
  img: {
    attr: 'src',
    predicate,
    getRelativeUrl,
    change,
  },
  script: {
    attr: 'src',
    predicate,
    getRelativeUrl,
    change,
  },
};
