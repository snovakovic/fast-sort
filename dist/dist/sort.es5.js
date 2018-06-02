(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.sort = global.sort || {}, global.sort.js = factory());
}(this, (function () { 'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

// >>> INTERNALS <<<

var sorter = function sorter(direction, a, b) {
  if (a === b) return 0;
  if (a < b) return -direction;
  if (a == null) return 1;
  if (b == null) return -1;

  return direction;
};

/**
 * String sorter does not support nested property.
 * For nested properties or value transformation (e.g toLowerCase) we should use functionSorter
 * Based on benchmark testing using string sorter is bit faster then using equivalent function sorter
 * @example sort(users).asc('firstName')
 */
var stringSorter = function stringSorter(direction, sortBy, a, b) {
  return sorter(direction, a[sortBy], b[sortBy]);
};

/**
 * @example sort(users).asc(p => p.address.city)
 */
var functionSorter = function functionSorter(direction, sortBy, a, b) {
  return sorter(direction, sortBy(a), sortBy(b));
};

/**
 * Return string or function sorter depending on sortBy value
 * @param {Function, String} sortBy
 * @returns {Function} sorter
 */
var getMultyPropertySort = function getMultyPropertySort(sortBy) {
  if (typeof sortBy === 'string') {
    return stringMultyPropertySort; // eslint-disable-line no-use-before-define
  }

  return functionMultyPropertySort; // eslint-disable-line no-use-before-define
};

var multyPropertySort = function multyPropertySort(valA, valB, direction, thenBy, depth, a, b) {
  if (valA === valB) {
    if (thenBy.length > depth) {
      return getMultyPropertySort(thenBy[depth])(direction, thenBy[depth], thenBy, depth + 1, a, b);
    }
    return 0;
  }

  return sorter(direction, valA, valB);
};

/**
 * Used when we have sorting by multyple properties and when current sorter is function
 * @example sort(users).asc([p => p.address.city, p => p.firstName])
 */
var functionMultyPropertySort = function functionMultyPropertySort(direction, sortBy, thenBy, depth, a, b) {
  return multyPropertySort(sortBy(a), sortBy(b), direction, thenBy, depth, a, b);
};

/**
 * Used when we have sorting by multyple properties and when current sorter is string
 * @example sort(users).asc(['firstName', 'lastName'])
 */
var stringMultyPropertySort = function stringMultyPropertySort(direction, sortBy, thenBy, depth, a, b) {
  return multyPropertySort(a[sortBy], b[sortBy], direction, thenBy, depth, a, b);
};

/**
 * Pick sorter based on provided sortBy value
 * @param {Array} ctx - Array that will be sorted
 * @param {undefined, String, Function, Function[]} sortBy
 */
var sort = function sort(direction, ctx, sortBy) {
  if (!Array.isArray(ctx)) return ctx;

  // Unwrap sortBy if array with only 1 value
  if (Array.isArray(sortBy) && sortBy.length < 2) {
    var _sortBy = sortBy;

    var _sortBy2 = _slicedToArray(_sortBy, 1);

    sortBy = _sortBy2[0];
  }

  var _sorter = void 0;

  if (!sortBy) {
    _sorter = sorter.bind(undefined, direction);
  } else if (typeof sortBy === 'string') {
    _sorter = stringSorter.bind(undefined, direction, sortBy);
  } else if (Array.isArray(sortBy)) {
    _sorter = getMultyPropertySort(sortBy[0]).bind(undefined, direction, sortBy.shift(), sortBy, 0);
  } else {
    _sorter = functionSorter.bind(undefined, direction, sortBy);
  }

  return ctx.sort(_sorter);
};

// >>> PUBLIC <<<

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
