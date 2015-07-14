// selector
const $ = (selector, scope) => {
  scope = scope || document;
  if(/^#\S+/.test(selector)) return scope.querySelector(selector);
  return [].slice.call(scope.querySelectorAll(selector));
};

export { $ }
