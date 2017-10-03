(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.sort = global.sort || {}, global.sort.js = factory());
}(this, (function () { 'use strict';

// Internals

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

var emptySortBy = function emptySortBy(a) {
  return a;
};

var sort = function sort(direction, ctx) {
  var sortBy = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : emptySortBy;

  if (!Array.isArray(ctx)) return ctx;

  var _sorter = Array.isArray(sortBy) ? sorter.bind(undefined, direction, sortBy.shift(), sortBy, 0) : sorter.bind(undefined, direction, sortBy, undefined, 0);

  return ctx.sort(_sorter);
};

// Public

var sort_1 = function sort_1(ctx) {
  return {
    asc: function asc(sortBy) {
      return sort(1, ctx, sortBy);
    },
    desc: function desc(sortBy) {
      return sort(-1, ctx, sortBy);
    }
  };
};

return sort_1;

})));
