// >>> INTERFACES <<<

interface ISortByFunction<T> {
  (prop:T):any
}

type ISortBy<T> = string|ISortByFunction<T>|(string|ISortByFunction<T>)[];

interface ISortByObjectBase {
  comparer?:any, // TODO: Change to actual interface
}

interface ISortByAscSorter<T> extends ISortByObjectBase {
  asc: boolean|ISortBy<T>,
}

interface ISortByDescSorter<T> extends ISortByObjectBase {
  desc: boolean|ISortBy<T>,
}

type ISortByObjectSorter<T> = ISortByAscSorter<T>|ISortByDescSorter<T>;

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
 * Used with 'by' sorter when we have sorting in multiple direction.
 * Eventually it will resolve to multiPropFunctionSorter or multiPropStringSorter
 * @example sort(users).asc(['firstName', 'lastName'])
 */
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
  if (valA === valB || (valA == null && valB == null)) {
    if (thenBy.length > depth) {
      const multiSorter = getMultiPropertySorter(thenBy[depth]);
      return multiSorter(thenBy[depth], thenBy, depth + 1, direction, comparer, a, b);
    }
    return 0;
  }

  return comparer(direction, valA, valB);
};

function unpackObjectSorter(sortByObj:ISortByObjectSorter<any>) {
  const sortBy = (sortByObj as ISortByAscSorter<any>).asc || (sortByObj as ISortByDescSorter<any>).desc;
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
 * Pick sorter based on provided sortBy value
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
  if(direction)
  if (!sortBy || sortBy === true) {
    sorter = comparer.bind(undefined, direction);
  } else if (typeof sortBy === 'string') {
    sorter = stringSorter.bind(undefined, direction, sortBy, comparer);
  } else if (typeof sortBy === 'function') {
    sorter = functionSorter.bind(undefined, direction, sortBy, comparer);
  } else if(Array.isArray(sortBy)) {
    sorter = getMultiPropertySorter(sortBy[0])
      .bind(undefined, sortBy.shift(), sortBy, 0, direction, comparer);
  } else {
    const objectSorterConfig = unpackObjectSorter(sortBy);
    return sort(objectSorterConfig.direction, ctx, objectSorterConfig.sortBy, objectSorterConfig.comparer);
  }

  return ctx.sort(sorter);
};

// >>> PUBLIC <<<

export default function<T>(ctx:T[]) {
  return {
    asc(sortBy?:ISortBy<T>|ISortBy<T>[]):T[] {
      return sort(1, ctx, sortBy, defaultComparer);
    },
    desc(sortBy?:ISortBy<T>|ISortBy<T>[]):T[] {
      return sort(-1, ctx, sortBy, defaultComparer);
    },
    by(sortBy:ISortByObjectSorter<T>|ISortByObjectSorter<T>[]):T[] {
      return sort(1, ctx, sortBy, defaultComparer);
    }
  };
};
