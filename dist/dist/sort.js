/* eslint no-use-before-define: 0 */

// >>> SORTERS <<<

const sorter = function(direction, a, b) {
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
const stringSorter = function(direction, sortBy, a, b) {
  return sorter(direction, a[sortBy], b[sortBy]);
};

/**
 * @example sort(users).asc(p => p.address.city)
 */
const functionSorter = function(direction, sortBy, a, b) {
  return sorter(direction, sortBy(a), sortBy(b));
};

/**
 * Used when we have sorting by multyple properties and when current sorter is function
 * @example sort(users).asc([p => p.address.city, p => p.firstName])
 */
const multiPropFunctionSorter = function(sortBy, thenBy, depth, direction, a, b) {
  return multiPropEqualityHandler(sortBy(a), sortBy(b), thenBy, depth, direction, a, b);
};

/**
 * Used when we have sorting by multiple properties and when current sorter is string
 * @example sort(users).asc(['firstName', 'lastName'])
 */
const multiPropStringSorter = function(sortBy, thenBy, depth, direction, a, b) {
  return multiPropEqualityHandler(a[sortBy], b[sortBy], thenBy, depth, direction, a, b);
};

/**
 * Used with 'by' sorter when we have sorting in multiple direction
 * @example sort(users).asc(['firstName', 'lastName'])
 */
const multiPropObjectSorter = function(sortByObj, thenBy, depth, _direction, a, b) {
  const sortBy = sortByObj.asc || sortByObj.desc;
  const direction = sortByObj.asc ? 1 : -1;

  if (!sortBy) {
    throw Error(`sort: Invalid 'by' sorting configuration.
      Expecting object with 'asc' or 'desc' key`);
  }

  const multiSorter = getMultiPropertySorter(sortBy);
  return multiSorter(sortBy, thenBy, depth, direction, a, b);
};

// >>> HELPERS <<<

/**
 * Return multiProperty sort handler based on sortBy value
 */
const getMultiPropertySorter = function(sortBy) {
  const type = typeof sortBy;
  if (type === 'string') {
    return multiPropStringSorter;
  } else if (type === 'function') {
    return multiPropFunctionSorter;
  }

  return multiPropObjectSorter;
};

const multiPropEqualityHandler = function(valA, valB, thenBy, depth, direction, a, b) {
  if (valA === valB || (valA == null && valB == null)) {
    if (thenBy.length > depth) {
      const multiSorter = getMultiPropertySorter(thenBy[depth]);
      return multiSorter(thenBy[depth], thenBy, depth + 1, direction, a, b);
    }
    return 0;
  }

  return sorter(direction, valA, valB);
};

/**
 * Pick sorter based on provided sortBy value
 */
const sort = function(direction, ctx, sortBy) {
  if (!Array.isArray(ctx)) return ctx;

  // Unwrap sortBy if array with only 1 value
  if (Array.isArray(sortBy) && sortBy.length < 2) {
    [sortBy] = sortBy;
  }

  let _sorter;

  if (!sortBy) {
    _sorter = sorter.bind(undefined, direction);
  } else if (typeof sortBy === 'string') {
    _sorter = stringSorter.bind(undefined, direction, sortBy);
  } else if (typeof sortBy === 'function') {
    _sorter = functionSorter.bind(undefined, direction, sortBy);
  } else {
    _sorter = getMultiPropertySorter(sortBy[0])
      .bind(undefined, sortBy.shift(), sortBy, 0, direction);
  }

  return ctx.sort(_sorter);
};

// >>> PUBLIC <<<

module.exports = function(ctx) {
  return {
    asc: (sortBy) => sort(1, ctx, sortBy),
    desc: (sortBy) => sort(-1, ctx, sortBy),
    by: (sortBy) => {
      if (!Array.isArray(ctx)) return ctx;

      if (!Array.isArray(sortBy)) {
        throw Error(`sort: Invalid usage of 'by' sorter. Array syntax is required.
          Did you mean to use 'asc' or 'desc' sorter instead?`);
      }

      // Unwrap sort by to faster path
      if (sortBy.length === 1) {
        const direction = sortBy[0].asc ? 1 : -1;
        const sortOnProp = sortBy[0].asc || sortBy[0].desc;
        if (!sortOnProp) {
          throw Error(`sort: Invalid 'by' sorting configuration.
            Expecting object with 'asc' or 'desc' key`);
        }
        return sort(direction, ctx, sortOnProp);
      }

      const _sorter = multiPropObjectSorter.bind(undefined, sortBy.shift(), sortBy, 0, undefined);
      return ctx.sort(_sorter);
    }
  };
};
