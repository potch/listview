(function () {

  var DEFAULT_HEIGHT = 48;

  function computeMetrics(listview) {
    console.log('el height', listview.offsetHeight);
    listview.xtag.numItemsVisible = (listview.offsetHeight / listview.height|0) + 1;
  }

  function init(listview) {
    console.log(listview, 'init');
    var ns = listview.xtag;
    var data = ns.data;
    if (!data) {
      return;
    }
    ns.deadPool = [];
    ns.visibleItems = [];
    ns.items = {};
    ns.list.style.height = listview.height * data.length + 'px';
  }

  function renderItem(listview, i) {
    var div;
    var deadPool = listview.xtag.deadPool;
    var height = listview.height;
    if (deadPool.length) {
      div = deadPool.pop();
    } else {
      div = document.createElement('div');
    }
    div.classList.add('item');
    div.innerHTML = items[i];
    div.style.transform = 'translateY(' + i * height + 'px)';
    div.style.webkitTransform = 'translateY(' + i * height + 'px)';
    return div;
  }

  function render(listview) {
    if (!listview.xtag.data) {
      return;
    }

    var ns = listview.xtag;
    var list = ns.list;
    var itemWindow = ns.numItemsVisible;
    if (!itemWindow) {
      computeMetrics(listview);
      itemWindow = ns.numItemsVisible;
    }

    var items = ns.items;
    var visibleItems = ns.visibleItems;
    var deadPool = ns.deadPool;
    var height = listview.height;
    var min = Math.max((listview.scrollTop / height|0) - itemWindow, 0);
    var max = Math.min((listview.scrollTop / height|0) + itemWindow * 2, numItems);

    if (!ns.data.length) {
      return;
    }

    if (ns.nextFrame) {
      xtag.cancelFrame(ns.nextFrame);
    }
    ns.nextFrame = xtag.requestFrame(function() {
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
          render(lv);
        });
        init(this);
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


