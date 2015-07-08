let $ = (selector) => {
  if(/^#\S+/.test(selector)) return document.querySelector(selector);
  return [].slice.call(document.querySelectorAll(selector));
};
