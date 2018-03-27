// >>> INTERNALS <<<

const sorter = function(direction, sortBy, thenBy, depth, a, b) {
  const valA = sortBy(a);
  const valB = sortBy(b);

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

const emptySortBy = (a) => a;

const sort = function(direction, ctx, sortBy = emptySortBy) {
  if (!Array.isArray(ctx)) return ctx;

  const _sorter = Array.isArray(sortBy)
    ? sorter.bind(undefined, direction, sortBy.shift(), sortBy, 0)
    : sorter.bind(undefined, direction, sortBy, undefined, 0);

  return ctx.sort(_sorter);
};

// >>> PUBLIC <<<

module.exports = function(ctx) {
  return {
    asc: (sortBy) => sort(1, ctx, sortBy),
    desc: (sortBy) => sort(-1, ctx, sortBy)
  };
};
