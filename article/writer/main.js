import { $ } from '../../theme/default/js/helpers';
import * as fullscreen from '../../theme/default/js/fullscreen';

// extend toMd() with to-markdown plugin
Pen.prototype.toMd = function() {
  return toMarkdown(this.getContent());
};

// show content on a layer
const show = (content) => {
  let id = '#show'
  let layer = $(id) || (() => {
      let layer = document.createElement('div');
      layer.setAttribute('id', id.slice(1));
      document.body.appendChild(layer);
      return layer;
    })();

  let text = `<pre></pre><button class="close">&times;</button>`;
  layer.innerHTML = text;
  layer.querySelector('pre').textContent = content;
  layer.classList.add('active');

  layer.addEventListener('click', e => {
    if(e.target.className.match('close')) layer.classList.remove('active');
  });
};

// start a writer
let $writer = $('#writer');
let options = {
  editor: $writer,
  debug: true,
  list: ['insertimage', 'h2', 'h3', 'p', 'code', 'insertorderedlist', 'insertunorderedlist', 'inserthorizontalrule',
    'indent', 'outdent', 'bold', 'italic', 'underline', 'createlink']
};

let editor = new Pen(options);
$writer.focus();

// words count
let $count = $('#count');
let count = () => {
  console.log($writer, $writer.textContent);
  let length = $writer.textContent.length;
  $count.textContent = length;
  console.log(length, 1);
};
count();

// auto save
let save = () => {
  localStorage.setItem('content', editor.getContent());
  count();
};
$writer.addEventListener('keyup', save);
window.onbeforeunload = save;

// retry content from localStorage
window.onload = () => {
  let content = localStorage.getItem('content');
  if(content) $writer.innerHTML = content;
};

// utilities
let $fullscreen = $('#fullscreen');
let $tohtml = $('#tohtml');
let $toMd = $('#tomd');

$fullscreen.addEventListener('click', () => {
  fullscreen.enter(document.documentElement);
  if(fullscreen.enabled && $fullscreen.src.includes('leave.svg')) {
    fullscreen.leave();
    $fullscreen.src = $fullscreen.src.replace('leave', 'enter');
  } else if ($fullscreen.src.includes('enter.svg')) {
    $fullscreen.src = $fullscreen.src.replace('enter', 'leave');
  }
});
$tohtml.addEventListener('click', () => show(editor.getContent()));
$toMd.addEventListener('click', () => show(editor.toMd()));
