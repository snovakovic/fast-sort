(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.sort = global.sort || {}, global.sort.js = factory());
}(this, (function () { 'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* eslint no-use-before-define: 0 */

// >>> SORTERS <<<

var sorter = function sorter(direction, a, b) {
  if (a === b) return 0;
  if (a < b) return -direction;
  if (a == null) return 1;
  if (b == null) return -1;

  return direction;
};

/**
 * stringSorter does not support nested property.
 * For nested properties or value transformation (e.g toLowerCase) we should use functionSorter
 * Based on benchmark testing using stringSorter is bit faster then using equivalent function sorter
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
 * Used when we have sorting by multyple properties and when current sorter is function
 * @example sort(users).asc([p => p.address.city, p => p.firstName])
 */
var multiPropFunctionSorter = function multiPropFunctionSorter(sortBy, thenBy, depth, direction, a, b) {
  return multiPropEqualityHandler(sortBy(a), sortBy(b), thenBy, depth, direction, a, b);
};

/**
 * Used when we have sorting by multiple properties and when current sorter is string
 * @example sort(users).asc(['firstName', 'lastName'])
 */
var multiPropStringSorter = function multiPropStringSorter(sortBy, thenBy, depth, direction, a, b) {
  return multiPropEqualityHandler(a[sortBy], b[sortBy], thenBy, depth, direction, a, b);
};

/**
 * Used with 'by' sorter when we have sorting in multiple direction
 * @example sort(users).asc(['firstName', 'lastName'])
 */
var multiPropObjectSorter = function multiPropObjectSorter(sortByObj, thenBy, depth, _direction, a, b) {
  var sortBy = sortByObj.asc || sortByObj.desc;
  var direction = sortByObj.asc ? 1 : -1;

  if (!sortBy) {
    throw Error('sort: Invalid \'by\' sorting configuration.\n      Expecting object with \'asc\' or \'desc\' key');
  }

  var multiSorter = getMultiPropertySorter(sortBy);
  return multiSorter(sortBy, thenBy, depth, direction, a, b);
};

// >>> HELPERS <<<

/**
 * Return multiProperty sort handler based on sortBy value
 */
var getMultiPropertySorter = function getMultiPropertySorter(sortBy) {
  var type = typeof sortBy === 'undefined' ? 'undefined' : _typeof(sortBy);
  if (type === 'string') {
    return multiPropStringSorter;
  } else if (type === 'function') {
    return multiPropFunctionSorter;
  }

  return multiPropObjectSorter;
};

var multiPropEqualityHandler = function multiPropEqualityHandler(valA, valB, thenBy, depth, direction, a, b) {
  if (valA === valB || valA == null && valB == null) {
    if (thenBy.length > depth) {
      var multiSorter = getMultiPropertySorter(thenBy[depth]);
      return multiSorter(thenBy[depth], thenBy, depth + 1, direction, a, b);
    }
    return 0;
  }

  return sorter(direction, valA, valB);
};

/**
 * Pick sorter based on provided sortBy value
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
  } else if (typeof sortBy === 'function') {
    _sorter = functionSorter.bind(undefined, direction, sortBy);
  } else {
    _sorter = getMultiPropertySorter(sortBy[0]).bind(undefined, sortBy.shift(), sortBy, 0, direction);
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
    },
    by: function by(sortBy) {
      if (!Array.isArray(ctx)) return ctx;

      if (!Array.isArray(sortBy)) {
        throw Error('sort: Invalid usage of \'by\' sorter. Array syntax is required.\n          Did you mean to use \'asc\' or \'desc\' sorter instead?');
      }

      // Unwrap sort by to faster path
      if (sortBy.length === 1) {
        var direction = sortBy[0].asc ? 1 : -1;
        var sortOnProp = sortBy[0].asc || sortBy[0].desc;
        if (!sortOnProp) {
          throw Error('sort: Invalid \'by\' sorting configuration.\n            Expecting object with \'asc\' or \'desc\' key');
        }
        return sort(direction, ctx, sortOnProp);
      }

      var _sorter = multiPropObjectSorter.bind(undefined, sortBy.shift(), sortBy, 0, undefined);
      return ctx.sort(_sorter);
    }
  };
};

return sort_1;

})));
