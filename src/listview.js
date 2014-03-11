(function () {

  var DEFAULT_HEIGHT = 48;
  var SCROLL_TIMEOUT = 100;

  function computeMetrics(listview) {
    listview.xtag.numItemsVisible = (listview.offsetHeight / listview.height|0) + 1;
  }

  function init(listview) {
    var ns = listview.xtag;
    var data = ns.data;
    if (!data) {
      return;
    }
    ns.deadPool = [];
    ns.visibleItems = [];
    ns.items = {};
    ns.skippedFrames = 0;
    ns.list.style.height = listview.height * data.length + 'px';
  }

  function renderItem(listview, i) {
    var div, img, span;
    var deadPool = listview.xtag.deadPool;
    var height = listview.height;
    if (deadPool.length) {
      div = deadPool.pop();
      img = div.querySelector('img');
      span = div.querySelector('span');
      img.setAttribute('alt', ' ');
    } else {
      div = document.createElement('div');
      div.classList.add('item');
      img = document.createElement('img');
      span = document.createElement('span');
      div.appendChild(img);
      div.appendChild(span);
    }
    img.src = '';
    var item = items[i];
    if (typeof item === 'object') {
      div.setAttribute('data-id', item.id);
      span.innerHTML = item.label || item.id || i;
      if ('icon' in item) {
        xtag.requestFrame(function () {
          img.src = item.icon;
        });
      }
    } else {
      div.setAttribute('data-id', i);
      span.innerHTML = item;
    }
    div.style.transform = 'translateY(' + i * height + 'px)';
    div.style.webkitTransform = 'translateY(' + i * height + 'px)';
    return div;
  }

  function stopScrolling(listview) {
    xtag.removeClass(listview, 'scrolling');
  }

  function render(listview) {
    var ns = listview.xtag;
    ns.skippedFrames = 0;
    var itemWindow = ns.numItemsVisible;
    if (!itemWindow) {
      computeMetrics(listview);
      itemWindow = ns.numItemsVisible;
    }
    var list = ns.list;
    var items = ns.items;
    var visibleItems = ns.visibleItems;
    var deadPool = ns.deadPool;
    var height = listview.height;
    var min = Math.max((listview.scrollTop / height|0) - itemWindow, 0);
    var max = Math.min((listview.scrollTop / height|0) + itemWindow * 2, numItems);
    for (var i = min; i < max; i++) {
      if (!items[i]) {
        var newEl = renderItem(listview, i);
        items[i] = newEl;
        visibleItems.push(i);
        list.appendChild(newEl);
      }
    }
    for (i = 0; i < visibleItems.length; i++) {
      var idx = visibleItems[i];
      if (idx < min || idx > max) {
        deadPool.push(items[idx]);
        visibleItems.splice(i,1);
        delete items[idx];
        i--;
      }
    }
  }

  function scroll(listview) {
    if (!listview.xtag.data) {
      return;
    }

    var ns = listview.xtag;

    if (!ns.data.length) {
      return;
    }

    if (!ns.scrolling) {
      xtag.addClass(listview, 'scrolling');
    }
    ns.scrolling = true;
    if (ns.scrollTimeout) {
      clearTimeout(ns.scrollTimeout);
    }
    ns.scrollTimeout = setTimeout(function () {
      ns.scrolling = false;
      stopScrolling(listview);
    }, SCROLL_TIMEOUT);

    if (ns.nextFrame) {
      ns.skippedFrames = ns.skippedFrames + 1;
      if (ns.skippedFrames < 4) {
        // xtag.cancelFrame(ns.nextFrame);
      }
    }
    ns.nextFrame = xtag.requestFrame(function () {
      render(listview);
    });
  }

  xtag.register('list-view', {
    lifecycle: {
      created: function () {
        var list = document.createElement('div');
        xtag.addClass(list, 'list');
        this.xtag.list = list;
        this.appendChild(list);
      },
      inserted: function () {
        var lv = this;
        this.xtag.scrollHandler = lv.addEventListener('scroll', function() {
          scroll(lv);
        });
        init(this);
      }
    },
    events: {
      'tap:delegate(.item)': function (e) {
        var listview = e.currentTarget;
        var el = this;
        var item = listview.xtag.data[el.getAttribute('data-id')];
      }
    },
    accessors: {
      'height': {
        get: function () {
          return this.xtag.height || DEFAULT_HEIGHT;
        },
        set: function (newVal) {
          this.xtag.height = newVal;
          render(this);
        }
      },
      'data': {
        set: function (data) {
          this.xtag.data = data;
          init(this);
          render(this);
        }
      }
    }
  });

})();


