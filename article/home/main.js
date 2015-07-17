import { $ } from '../../theme/default/js/helpers';

// build posts
let displayPosts = articles => {
  let ul = $('#posts');
  let lis = '';
  articles.length && articles.forEach((article, i) => {
    if(i > 2) return;
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
fetch('/api/article.json')
  .then(res => res.json())
  .then(displayPosts)
  .catch(err => console.warn(err));
