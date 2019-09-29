import isRelativeUrl from 'is-relative-url';

const ch = (node, dom, p, attr) => dom(node).attr(attr, p);

export default {
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
