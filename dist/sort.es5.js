(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.sort = global.sort || {}, global.sort.js = factory());
}(this, (function () { 'use strict';

var sorter = function sorter(direction, sortBy, thenBy, depth, a, b) {
  var valA = sortBy(a);
  var valB = sortBy(b);

  if (valA === valB) {
    if (thenBy && thenBy.length > depth) {
      return sorter(direction, thenBy[depth], thenBy, depth + 1, a, b);
    }
    return 0;
  }

  if (valA < valB) return -direction;
  if (valA == null) return 1;
  if (valB == null) return -1;

  return direction;
};

var ascSorter = sorter.bind(null, 1);
var descSorter = sorter.bind(null, -1);

var emptySortBy = function emptySortBy(a) {
  return a;
};

var sort = function sort(ctx, _sorter) {
  var sortBy = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : emptySortBy;

  if (!Array.isArray(ctx)) return ctx;

  return Array.isArray(sortBy) ? ctx.sort(_sorter.bind(undefined, sortBy.shift(), sortBy, 0)) : ctx.sort(_sorter.bind(undefined, sortBy, undefined, 0));
};

// Public

var sort_1 = function sort_1(ctx) {
  return {
    asc: function asc(sortBy) {
      return sort(ctx, ascSorter, sortBy);
    },
    desc: function desc(sortBy) {
      return sort(ctx, descSorter, sortBy);
    }
  };
};

return sort_1;

})));
