import { $ } from './helpers';

// comment plugin by disqus
(loader => {
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
(externalLinks => {
  externalLinks.forEach(link => {
    if(!link.href.match(/^https?:\/\/sofi.sh\//)) link.setAttribute('target', '_blank')
  });
})($('a'));

// loader image in async way
(asyncs => {
  asyncs.forEach(async => {
    async.onload = () => async.removeAttribute('async-src');
    async.src = async.getAttribute('async-src');
  });
})($('[async-src]'));

((input, complete) => {

  let compose = data => {
    let tmpl = data => {
      return `<li>
        <a href="${data.url}">${data.title}</a><br>
        <small>${data.description}</small>
        </li>`;
    };
    return data.reduce((ret, cur) => {
      ret.push(tmpl(cur));
      return ret;
    }, []).join('');
  };

  input.addEventListener('keyup', () => {
    let val = input.value;
    if(!val.length || val.length < 2) return complete.style.display = 'none';

    fetch('http://sofi.sh/search/' + val)
      .then(res => res.json())
      .then(res => {
        let text = res.error ? '' : compose(res.data);
        complete.innerHTML = text;
        complete.style.display = 'block';
      })
      .catch(err => console.log(err));
  });

  input.addEventListener('blur', () => {
    setTimeout(() => {
      complete.innerHTML = '';
      complete.style.display = 'none';
    }, 200);
  });
})($('.nav .search-input')[0], $('.nav .search-complete')[0]);


// Array.from
Array.from = Array.from  || function(arrayLikeObject) {
  return [].slice.call(arrayLikeObject);
};
