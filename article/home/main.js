import { $ } from '../../theme/default/js/helpers';

// build posts
let displayPosts = (articles) => {
  let ul = $('#posts');
  let lis = '';
  articles.length && articles.forEach((article, i) => {
    let birthtime = new Date(article.createdAt).toLocaleDateString();
    lis += `
      <div>${i + 1}. <a href="${article.url}">${article.title}</a> <small>${birthtime}</small>
        <p class="typo-small">${article.description}<br>
        </p>
      </div>
    `;
  });
  ul.innerHTML = lis;
}

// display posts
let xhr = new XMLHttpRequest();
xhr.open('GET', '/api/article.json');
xhr.onreadystatechange = () => {
  if(xhr.readyState !== 4) return;
  let articles = JSON.parse(xhr.responseText);
  displayPosts(articles);
};

xhr.send();

// remove #gohome link
var gohome = $('#gohome');
gohome.parentNode.removeChild(gohome);
