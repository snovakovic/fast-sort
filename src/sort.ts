// >>> COMPARERS <<<

const defaultComparer = function(direction:number, a, b):number {
  if (a < b) return -direction;
  if (a === b) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  return direction;
};

const customComparerHandler = (comparer) => (direction, a, b) => comparer(a, b) * direction;

// >>> SORTERS <<<

const stringSorter = function(direction, sortBy, comparer, a, b) {
  return comparer(direction, a[sortBy], b[sortBy]);
};

const functionSorter = function(direction, sortBy, comparer, a, b) {
  return comparer(direction, sortBy(a), sortBy(b));
};

const multiPropFunctionSorter = function(sortBy, thenBy, depth, direction, comparer, a, b) {
  return multiPropEqualityHandler(sortBy(a), sortBy(b), thenBy, depth, direction, comparer, a, b);
};

const multiPropStringSorter = function(sortBy, thenBy, depth, direction, comparer, a, b) {
  return multiPropEqualityHandler(a[sortBy], b[sortBy], thenBy, depth, direction, comparer, a, b);
};

const multiPropObjectSorter = function(sortByObj, thenBy, depth, _direction, _comparer, a, b) {
  const { sortBy, direction, comparer } = unpackObjectSorter(sortByObj);
  const multiSorter = getMultiPropertySorter(sortBy);
  return multiSorter(sortBy, thenBy, depth, direction, comparer, a, b);
};

// >>> HELPERS <<<

const getMultiPropertySorter = function(sortBy) {
  switch(typeof sortBy) {
    case 'string':
      return multiPropStringSorter;
    case 'function':
      return multiPropFunctionSorter;
    default:
      return multiPropObjectSorter;
  }
}

const multiPropEqualityHandler = function(valA, valB, thenBy, depth, direction, comparer, a, b) {
  const equality = comparer(direction, valA, valB);
  if(
    thenBy.length > depth &&
    (equality === 0 || (valA == null && valB == null))
  ) {
    const multiSorter = getMultiPropertySorter(thenBy[depth]);
    return multiSorter(thenBy[depth], thenBy, depth + 1, direction, comparer, a, b);
  }

  return equality;
};

const unpackObjectSorter = function(sortByObj) {
  const sortBy = sortByObj.asc || sortByObj.desc;
  const direction = (sortByObj as any).asc ? 1 : -1;
  const comparer = sortByObj.comparer
    ? customComparerHandler(sortByObj.comparer)
    : defaultComparer;

  if (!sortBy) {
    throw Error(`Invalid config. Expecting object with 'asc' or 'desc' keys`);
  }

  return { direction, sortBy, comparer };
}

/**
 * Pick sorter based on provided sortBy configuration.
 */
const sort = function(direction, ctx, sortBy, comparer) {
  if (!Array.isArray(ctx)) {
    return ctx;
  }

  // Unwrap sortBy if array with only 1 value
  if (Array.isArray(sortBy) && sortBy.length < 2) {
    [sortBy] = sortBy;
  }

  let sorter;
  if (!sortBy || sortBy === true) {
    sorter = comparer.bind(undefined, direction);
  } else if (typeof sortBy === 'string') {
    sorter = stringSorter.bind(undefined, direction, sortBy, comparer);
  } else if (typeof sortBy === 'function') {
    sorter = functionSorter.bind(undefined, direction, sortBy, comparer);
  } else if (Array.isArray(sortBy)) {
    sorter = getMultiPropertySorter(sortBy[0])
      .bind(undefined, sortBy.shift(), sortBy, 0, direction, comparer);
  } else {
    const objectSorterConfig = unpackObjectSorter(sortBy);
    return sort(objectSorterConfig.direction, ctx, objectSorterConfig.sortBy, objectSorterConfig.comparer);
  }

  return ctx.sort(sorter);
};

// >>> PUBLIC <<<

export interface ISortByFunction<T> {
  (prop:T):any
}

export type ISortBy<T> = string|ISortByFunction<T>|(string|ISortByFunction<T>)[];

export interface ICustomComparer {
  comparer?(a:any, b:any):number,
}

export interface ISortByAscSorter<T> extends ICustomComparer {
  asc: boolean|ISortBy<T>,
}

export interface ISortByDescSorter<T> extends ICustomComparer {
  desc: boolean|ISortBy<T>,
}

export type ISortByObjectSorter<T> = ISortByAscSorter<T>|ISortByDescSorter<T>;

export function createSortInstance({ comparer }:{ comparer:any }) {
  return function sortInstance<T>(ctx:T[]) {
    return {
      /**
       * @example sort(users).asc(u => u.firstName)
       */
      asc(sortBy?:ISortBy<T>|ISortBy<T>[]):T[] {
        return sort(1, ctx, sortBy, comparer);
      },
      /**
       * @example sort(users).desc(u => u.firstName)
       */
      desc(sortBy?:ISortBy<T>|ISortBy<T>[]):T[] {
        return sort(-1, ctx, sortBy, comparer);
      },
      /**
       * @example sort(users).by([{ asc: 'firstName'}, { desc: 'lastName' }])
       */
      by(sortBy:ISortByObjectSorter<T>|ISortByObjectSorter<T>[]):T[] {
        return sort(1, ctx, sortBy, comparer);
      }
    };
  }
}

export default createSortInstance({ comparer: defaultComparer });
