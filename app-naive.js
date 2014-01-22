// noprotect
var listc = document.querySelector('.item-container');

var items = [];

var numItems = 500;
var b = document.querySelector('#d');

function addItems () {
  for (var i=0; i<10000; i++) {
    if (items.length < numItems) {
      items.push((Math.PI + Math.random()).toString(36).substring(2,11));
      renderItem(i);
    } else {
      return;
    }
  }
  setTimeout(addItems, 0);
}
addItems();

function renderItem(n) {
  var div = document.createElement('div');
  div.classList.add('item');
  div.innerHTML = items[n];
  listc.appendChild(div);
  return div;
}
