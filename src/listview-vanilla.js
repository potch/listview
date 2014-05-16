(function () {

  var DEFAULT_HEIGHT = 48;
  var SCROLL_TIMEOUT = 100;

  window.requestAnimationFrame = window.requestAnimationFrame ||
                                 window.mozRequestAnimationFrame ||
                                 window.webkitRequestAnimationFrame ||
                                 window.msRequestAnimationFrame ||
                                 function (fn) { setTimeout(fn, 0); };


  function DataSource(data) {
    this.data = data;
    this.length = data.length;
  }
  DataSource.prototype.get = function(key) {
    var self = this;
    return new Promise(function (resolve, reject) {
      if (key in self.data) {
        resolve(self.data[key]);
      } else {
        reject();
      }
    });
  };

  function computeMetrics(listview) {
    listview.ns.numItemsVisible = (listview.offsetHeight / listview.height|0) + 1;
  }

  function init(listview) {
    var ns = listview.ns;
    var data = ns.data;
    if (!data) {
      return;
    }
    // A list of created, not-in-use DOM nodes
    ns.deadPool = [];
    // The indexes of the items currently rendered
    ns.visibleItems = [];
    // A lookup cache by index of items from ns.data
    ns.items = {};
    ns.skippedFrames = 0;
    // Set the height of the scrolling strip
    ns.list.style.height = listview.height * data.length + 'px';
  }

  function defaultRenderer(el, item, i) {
    var img = document.createElement('img');
    var span = document.createElement('span');
    el.appendChild(img);
    el.appendChild(span);

    if (typeof item === 'object') {
      el.setAttribute('data-id', item.id);
      span.innerHTML = item.label || item.id || i;
      if ('icon' in item) {
        img.onload = function () {
          img.style.opacity = 1;
        };
        img.src = item.icon;
      }
    } else {
      el.setAttribute('data-id', i);
      span.innerHTML = item;
    }
  }

  function renderItem(listview, i) {
    var div, img, span;
    var deadPool = listview.ns.deadPool;
    var height = listview.height;
    var data = listview.ns.data;
    if (deadPool.length) {
      div = deadPool.pop();
      div.innerHTML = '';
    } else {
      div = document.createElement('div');
      div.classList.add('item');
    }
    var item = data.get(i);
    if (typeof item.then === 'function') {
      item.then(function(item) {
        defaultRenderer(div, item, i);
      });
    } else {
      defaultRenderer(div, item, i);
    }
    // place the element along the scroll strip.
    div.style.transform = 'translateY(' + i * height + 'px)';
    div.style.webkitTransform = 'translateY(' + i * height + 'px)';
    return div;
  }

  function stopScrolling(listview) {
    listview.classList.remove('scrolling');
  }

  function render(listview) {
    var ns = listview.ns;
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
    var max = Math.min((listview.scrollTop / height|0) + itemWindow * 2, ns.data.length);
    for (var i = min; i < max; i++) {
      if (!items[i]) {
        var newEl = renderItem(listview, i);
        items[i] = newEl;
        visibleItems.push(i);
        if (!newEl.parentNode) {
          list.appendChild(newEl);
        }
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
    if (!listview.ns.data) {
      return;
    }

    var ns = listview.ns;

    if (!ns.data.length) {
      return;
    }

    if (!ns.scrolling) {
      listview.classList.add('scrolling');
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
      cancelAnimationFrame(ns.nextFrame);
    }
    ns.nextFrame = requestAnimationFrame(function () {
      render(listview);
    });
  }

  var ListViewPrototype = Object.create(HTMLElement.prototype);

  ListViewPrototype.createdCallback = function () {
    this.ns = {};
    var list = document.createElement('div');
    list.classList.add('list');
    this.ns.list = list;
    this.appendChild(list);
  };

  ListViewPrototype.attachedCallback = function () {
    var listview = this;
    this.ns.scrollHandler = listview.addEventListener('scroll', function() {
      scroll(listview);
    });
    init(this);
  };

  ListViewPrototype.detatchedCallback = function () {
    var listview = this;
    listview.removeEventListener('scroll', listview.ns.scrollHandler);
    init(this);
  };

  var attrs = {
    'height': function (oldVal, newVal) {
      this.ns.height = newVal;
      render(this);
    }
  };

  ListViewPrototype.attributeChangedCallback = function (attr, oldVal, newVal) {
    if (attr in attrs) {
      attrs[attr].call(this, oldVal, newVal);
    }
  };

  Object.defineProperty(ListViewPrototype, "height", {
    get : function () {
      return this.ns.height || DEFAULT_HEIGHT;
    },
    set : function (newVal) {
      console.log('set', newVal);
      this.ns.height = newVal;
      render(this);
    }
  });

  Object.defineProperty(ListViewPrototype, "data", {
    get : function () {
      return this.ns.data;
    },
    set : function (data) {
      this.ns.data = new DataSource(data);
      init(this);
      render(this);
    }
  });

  var ListView = document.registerElement('list-view', {
    prototype: ListViewPrototype
  });

})();


