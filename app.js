(function () {

(function () {
  var listc = document.querySelector('.item-container');
  var list = document.querySelector('.list');

  var items = [];
  var windowItems = [];
  var deadPool = [];
  var els = [];
  var height = 48;

  var b = document.querySelector('#d');

  var numItems = 50000;

  function addItems () {
    for (var i=0; i<10000; i++) {
      if (items.length < numItems) {
        items.push(i);
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
    var div;
    if (deadPool.length) {
      div = deadPool.pop();
    } else {
      div = document.createElement('div');
    }
    div.classList.add('item');
    div.innerHTML = items[n];
    div.style.transform = 'translateY(' + n * height + 'px)';
    div.style.webkitTransform = 'translateY(' + n * height + 'px)';
    return div;
  }

  list.addEventListener('scroll', renderWindow);
  var to;
  var min;
  var max;

  function cleanUp() {
    console.log('window', windowItems.length);
    console.log('pool', deadPool.length);
  }

  var nextFrame;

  function renderWindow() {
    min = Math.max((list.scrollTop / height|0) - itemWindow, 0);
    max = Math.min((list.scrollTop / height|0) + itemWindow * 2, numItems);

    if (nextFrame) {
      cancelAnimationFrame(nextFrame);
    }
    nextFrame = requestAnimationFrame(function() {
      for (var i = min; i < max; i++) {
        if (!els[i]) {
          var newEl = renderItem(i);
          els[i] = newEl;
          windowItems.push(i);
          listc.appendChild(newEl);
        }
      }
      for (i = 0; i < windowItems.length; i++) {
        var idx = windowItems[i];
        if (idx < min || idx > max) {
          deadPool.push(els[idx]);
          windowItems.splice(i,1);
          els[idx] = 0;
          i--;
        }
      }
    });
    clearTimeout(to);
    to = setTimeout(cleanUp, 200);
  }

  renderWindow();
})

  xtag.register('list-view', {
    lifecycle: {
      created: function () {

      }
    }
  });

})();


