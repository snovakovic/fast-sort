/* eslint no-use-before-define: 0 */

// >>> INTERFACES <<<

interface ISortByFunction<T> {
  (prop:T):any
}

type ISorter<T> = string|ISortByFunction<T>|(string|ISortByFunction<T>)[];

interface ISortBySorterBase {
  comparer?:any, // TODO: Change to actual interface
}

interface ISortByAscSorter<T> extends ISortBySorterBase {
  asc: boolean|ISorter<T>,
}

interface ISortByDescSorter<T> extends ISortBySorterBase {
  desc: boolean|ISorter<T>,
}

type ISortBySorter<T> = ISortByAscSorter<T>|ISortByDescSorter<T>;

// >>> SORTERS <<<

const defaultComparer = function(direction, a, b) {
  if (a < b) return -direction;
  if (a === b) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  return direction;
};

const customComparerHandler = (comparer) => (direction, a, b) => comparer(a, b) * direction;

/**
 * stringSorter does not support nested property.
 * For nested properties or value transformation (e.g toLowerCase) we should use functionSorter
 * Based on benchmark testing using stringSorter is bit faster then using equivalent function sorter
 * @example sort(users).asc('firstName')
 */
const stringSorter = function(direction, sortBy, comparer, a, b) {
  return comparer(direction, a[sortBy], b[sortBy]);
};

/**
 * @example sort(users).asc(p => p.address.city)
 */
const functionSorter = function(direction, sortBy, comparer, a, b) {
  return comparer(direction, sortBy(a), sortBy(b));
};

/**
 * Used when we have sorting by multiple properties and when current sorter is function
 * @example sort(users).asc([p => p.address.city, p => p.firstName])
 */
const multiPropFunctionSorter = function(sortBy, thenBy, depth, direction, comparer, a, b) {
  return multiPropEqualityHandler(sortBy(a), sortBy(b), thenBy, depth, direction, comparer, a, b);
};

/**
 * Used when we have sorting by multiple properties and when current sorter is string
 * @example sort(users).asc(['firstName', 'lastName'])
 */
const multiPropStringSorter = function(sortBy, thenBy, depth, direction, comparer, a, b) {
  return multiPropEqualityHandler(a[sortBy], b[sortBy], thenBy, depth, direction, comparer, a, b);
};

/**
 * Used with 'by' sorter when we have sorting in multiple direction
 * @example sort(users).asc(['firstName', 'lastName'])
 */
const multiPropObjectSorter = function(sortByObj, thenBy, depth, _direction, _comparer, a, b) {
  const sortBy = sortByObj.asc || sortByObj.desc;
  const direction = sortByObj.asc ? 1 : -1;
  const comparer = sortByObj.comparer
    ? customComparerHandler(sortByObj.comparer)
    : defaultComparer;

  if (!sortBy) {
    throw Error(`sort: Invalid 'by' sorting configuration.
      Expecting object with 'asc' or 'desc' key`);
  }

  const multiSorter = getMultiPropertySorter(sortBy);
  return multiSorter(sortBy, thenBy, depth, direction, comparer, a, b);
};

// >>> HELPERS <<<

/**
 * Return multiProperty sort handler based on sortBy value
 */
const getMultiPropertySorter = function(sortBy) {
  const type = typeof sortBy;
  if (type === 'string') {
    return multiPropStringSorter;
  }
  if (type === 'function') {
    return multiPropFunctionSorter;
  }

  return multiPropObjectSorter;
};

const multiPropEqualityHandler = function(valA, valB, thenBy, depth, direction, comparer, a, b) {
  if (valA === valB || (valA == null && valB == null)) {
    if (thenBy.length > depth) {
      const multiSorter = getMultiPropertySorter(thenBy[depth]);
      return multiSorter(thenBy[depth], thenBy, depth + 1, direction, comparer, a, b);
    }
    return 0;
  }

  return comparer(direction, valA, valB);
};

/**
 * Pick sorter based on provided sortBy value
 */
const sort = function(direction, ctx, sortBy, comparer) {
  if (!Array.isArray(ctx)) return ctx;

  // Unwrap sortBy if array with only 1 value
  if (Array.isArray(sortBy) && sortBy.length < 2) {
    [sortBy] = sortBy;
  }

  let _sorter;

  if (!sortBy || sortBy === true) {
    _sorter = comparer.bind(undefined, direction);
  } else if (typeof sortBy === 'string') {
    _sorter = stringSorter.bind(undefined, direction, sortBy, comparer);
  } else if (typeof sortBy === 'function') {
    _sorter = functionSorter.bind(undefined, direction, sortBy, comparer);
  } else {
    _sorter = getMultiPropertySorter(sortBy[0])
      .bind(undefined, sortBy.shift(), sortBy, 0, direction, comparer);
  }

  return ctx.sort(_sorter);
};

// >>> PUBLIC <<<

export default function<T>(ctx:T[]) {
  return {
    asc(sortBy?:ISorter<T>|ISorter<T>[]):T[] {
      return sort(1, ctx, sortBy, defaultComparer);
    },
    desc(sortBy?:ISorter<T>|ISorter<T>[]):T[] {
      return sort(-1, ctx, sortBy, defaultComparer);
    },
    by(sortBy:ISortBySorter<T>|ISortBySorter<T>[]):T[] {
      if (!Array.isArray(ctx)) return ctx;

      let sortByInSingleDirection;
      if (!Array.isArray(sortBy)) {
        sortByInSingleDirection = sortBy;
      } else if (sortBy.length === 1) {
        [sortByInSingleDirection] = sortBy;
      }

      // Unwrap sort by to faster path for dedicated single direction sorters
      if (sortByInSingleDirection) {
        const direction = sortByInSingleDirection.asc ? 1 : -1;
        const singleDirectionSortBy = sortByInSingleDirection.asc || sortByInSingleDirection.desc;
        const comparer = sortByInSingleDirection.comparer
          ? customComparerHandler(sortByInSingleDirection.comparer)
          : defaultComparer;

        if (!singleDirectionSortBy) {
          throw Error(`sort: Invalid 'by' sorting configuration.
            Expecting object with 'asc' or 'desc' key`);
        }
        return sort(direction, ctx, singleDirectionSortBy, comparer);
      }

      const _sorter = multiPropObjectSorter
        .bind(undefined, (sortBy as ISortBySorter<T>[]).shift(), sortBy, 0, undefined, undefined);

      return ctx.sort(_sorter);
    }
  };
};
