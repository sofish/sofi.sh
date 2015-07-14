import { $ } from './helpers';

// comment plugin by disqus
((loader) => {
  if(!loader) return;

  loader.addEventListener('click', function () {
    let disqus_shortname = 'sofishprofile';
    let dsq = document.createElement('script');

    dsq.type = 'text/javascript';
    dsq.async = true;
    dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';

    $('head')[0].appendChild(dsq);

    loader.textContent = '加载中...';
    let timer = setInterval(() => {
      if(!$('#disqus_thread').innerHTML) return;

      clearInterval(timer);
      loader.style.display = 'none';
    }, 30);

  })
})($('#comment-loader'));

// open external links in new tab
((externalLinks) => {
  externalLinks.forEach((link) => link.setAttribute('target', '_blank'));
})($('a:not([href^="http://sofi.sh"])'));

// loader image in async way
((asyncs) => {
  asyncs.forEach((async) => {
    async.onload = () => async.removeAttribute('async-src');
    async.src = async.getAttribute('async-src');
  });
})($('[async-src]'));


// Array.from
Array.from = Array.from  || function(arrayLikeObject) {
  return [].slice.call(arrayLikeObject);
};
