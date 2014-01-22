// noprotect
var listc = document.querySelector('.item-container');
var list = document.querySelector('.list');

var items = [];
var windowItems = [];
var els = [];
var height = 48;

var numItems = 500;
var b = document.querySelector('#d');

function addItems () {
  for (var i=0; i<10000; i++) {
    if (items.length < numItems) {
      items.push((Math.PI + Math.random()).toString(36).substring(2,11));
    } else {
      return;
    }
  }
  setTimeout(addItems, 0);
}
addItems();

listc.style.height = height * numItems + 'px';
var itemWindow = (list.offsetHeight / height|0)+1;

function renderItem(n) {
  var div = document.createElement('div');
  div.classList.add('item');
  div.innerHTML = items[n];
  div.style.top = n * height + 'px';
  return div;
}

list.addEventListener('scroll', renderWindow);
var to;
var min;
var max;

function cleanUp() {
  console.log(windowItems.length);
  for (i = 0; i < windowItems.length; i++) {
    var idx = windowItems[i];
    if (idx < min || idx > max) {
      listc.removeChild(els[idx]);
      windowItems.splice(i,1);
      els[idx] = null;
      i--;
    }
  }
}

function renderWindow() {
  min = Math.max((list.scrollTop / height|0) - itemWindow, 0);
  max = Math.min((list.scrollTop / height|0) + itemWindow * 2, numItems);
  for (var i = min; i < max; i++) {
    if (!els[i]) {
      var newEl = renderItem(i);
      els[i] = newEl;
      windowItems.push(i);
      listc.appendChild(newEl);
    }
  }
  clearTimeout(to);
  to = setTimeout(cleanUp, 1000);
}

renderWindow();