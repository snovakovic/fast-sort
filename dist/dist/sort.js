const getTag = require('./internals/getTag');


const sorter = function(direction, sortBy, subsequentSort, a, b) {
  const valA = sortBy(a);
  const valB = sortBy(b);

  if (valA === valB) {
    if (subsequentSort.length) {
      const subsequent = subsequentSort.slice();
      return sorter(direction, subsequent.shift(), subsequent, a, b);
    }
    return 0;
  }

  if (valA == null) return 1;
  if (valB == null) return -1;
  if (valA < valB) return -direction;

  return direction;
};

const ascSorter = sorter.bind(null, 1);
const descSorter = sorter.bind(null, -1);

const emptySortBy = (a) => a;

const assertSortBy = function(sortBy) {
  const invalidSortBy = sortBy.filter((s) => typeof s !== 'function');
  if (invalidSortBy.length) {
    throw new TypeError(`sort: expected [Function] but got ${getTag(invalidSortBy[0])}`);
  }
};

const sort = function(ctx, _sorter, sortBy = emptySortBy) {
  if (Array.isArray(ctx)) {
    sortBy = Array.isArray(sortBy) ? sortBy : [sortBy];
    assertSortBy(sortBy);
    return ctx.sort(_sorter.bind(null, sortBy.shift(), sortBy));
  }
  return ctx;
};

// Public

module.exports = function(ctx) {
  return {
    asc(sortBy) {
      return sort(ctx, ascSorter, sortBy);
    },
    desc(sortBy) {
      return sort(ctx, descSorter, sortBy);
    }
  };
};
