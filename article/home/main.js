// build posts
let displayPosts = (articles) => {
  let ul = $('#posts');
  let lis = '';
  articles.length && articles.forEach((article, i) => {
    lis += `
      <div>#${i} <a href="${article.url}">${article.title}</a>
        <p>${article.description}<br>
          <small>${article.createdAt}</small>
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
