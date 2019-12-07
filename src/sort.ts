// >>> SORTERS <<<

const stringSorter = function(direction, sortBy, comparer, a, b) {
  return comparer(a[sortBy], b[sortBy], direction);
};

const functionSorter = function(direction, sortBy, comparer, a, b) {
  return comparer(sortBy(a), sortBy(b), direction);
};

const multiPropFunctionSorter = function(sortBy, thenBy, depth, direction, comparer, a, b) {
  return multiPropEqualityHandler(sortBy(a), sortBy(b), thenBy, depth, direction, comparer, a, b);
};

const multiPropStringSorter = function(sortBy, thenBy, depth, direction, comparer, a, b) {
  return multiPropEqualityHandler(a[sortBy], b[sortBy], thenBy, depth, direction, comparer, a, b);
};

const multiPropObjectSorter = function(sortByObj, thenBy, depth, _direction, comparer, a, b) {
  const { sortBy, direction, comparer: objComparer } = unpackObjectSorter(sortByObj);
  const multiSorter = getMultiPropertySorter(sortBy);
  return multiSorter(sortBy, thenBy, depth, direction, objComparer || comparer, a, b);
};

// >>> HELPERS <<<

const comparerHandler = (comparer) => (a, b, direction) => comparer(a, b, direction) * direction;

const getMultiPropertySorter = function(sortBy) {
  switch (typeof sortBy) {
    case 'string':
      return multiPropStringSorter;
    case 'function':
      return multiPropFunctionSorter;
    default:
      return multiPropObjectSorter;
  }
};

const multiPropEqualityHandler = function(valA, valB, thenBy, depth, direction, comparer, a, b) {
  const equality = comparer(valA, valB, direction);
  if (
    thenBy.length > depth &&
    (equality === 0 || (valA == null && valB == null))
  ) {
    const multiSorter = getMultiPropertySorter(thenBy[depth]);
    return multiSorter(thenBy[depth], thenBy, depth + 1, direction, comparer, a, b);
  }

  return equality;
};

const unpackObjectSorter = function(sortByObj) {
  const sortBy = (sortByObj || {}).asc || (sortByObj || {}).desc;
  if (!sortBy) {
    throw Error('Invalid sort config');
  }

  const direction = sortByObj.asc ? 1 : -1;
  const comparer = sortByObj.comparer
    ? comparerHandler(sortByObj.comparer)
    : undefined;

  return { direction, sortBy, comparer };
};

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
  if (sortBy === undefined || sortBy === true) {
    sorter = (a, b) => comparer(a, b, direction);
  } else if (typeof sortBy === 'string') {
    sorter = stringSorter.bind(undefined, direction, sortBy, comparer);
  } else if (typeof sortBy === 'function') {
    sorter = functionSorter.bind(undefined, direction, sortBy, comparer);
  } else if (Array.isArray(sortBy)) {
    sorter = getMultiPropertySorter(sortBy[0])
      .bind(undefined, sortBy.shift(), sortBy, 0, direction, comparer);
  } else {
    const objectSorterConfig = unpackObjectSorter(sortBy);
    return sort(
      objectSorterConfig.direction,
      ctx,
      objectSorterConfig.sortBy,
      objectSorterConfig.comparer || comparer,
    );
  }

  return ctx.sort(sorter);
};

// >>> PUBLIC <<<

export interface ISortByFunction<T> {
  (prop:T):any,
}

export type ISortBy<T> = string|ISortByFunction<T>|(string|ISortByFunction<T>)[];

export interface ICustomComparer {
  comparer?(a:any, b:any, direction:number):number,
}

export interface ISortByAscSorter<T> extends ICustomComparer {
  asc:boolean|ISortBy<T>,
}

export interface ISortByDescSorter<T> extends ICustomComparer {
  desc:boolean|ISortBy<T>,
}

export type ISortByObjectSorter<T> = ISortByAscSorter<T>|ISortByDescSorter<T>;

export interface ICreateSortInstanceOptions extends ICustomComparer {
  delegateOrderApplyingToComparer?:boolean,
}

export function createSortInstance(opts:ICreateSortInstanceOptions) {
  const comparer = opts.delegateOrderApplyingToComparer
    ? opts.comparer
    : comparerHandler(opts.comparer);

  return function<T>(ctx:T[]) {
    return {
      /**
       * Sorts array in ascending order. Mutates provided array by sorting it.
       * @example
       * sort([3, 1, 4]).asc();
       * sort(users).asc('firstName');
       * sort(users).asc(u => u.address.zip);
       * sort(users).asc([
       *  'firstName',
       *  'lastName',
       *   u => u.address.zip,
       * ]);
       */
      asc(sortBy?:ISortBy<T>|ISortBy<T>[]):T[] {
        return sort(1, ctx, sortBy, comparer);
      },
      /**
       * Sorts array in descending order. Mutates provided array by sorting it.
       * @example
       * sort([3, 1, 4]).desc();
       * sort(users).desc('firstName');
       * sort(users).desc(u => u.address.zip);
       * sort(users).desc([z
       *  'firstName',
       *  'lastName',
       *   u => u.address.zip,
       * ]);
       */
      desc(sortBy?:ISortBy<T>|ISortBy<T>[]):T[] {
        return sort(-1, ctx, sortBy, comparer);
      },
      /**
       * Sorts array in ascending or descending order. It allows sorting on multiple props
       * by different direction for each prop. Mutates provided array by sorting it.
       * @example
       * sort(users).by([
       *  { asc: 'firstName' }.
       *  { desc: u => u.address.zip }
       * ]);
       * sort(users).by({ desc: 'lastName' });
       */
      by(sortBy:ISortByObjectSorter<T>|ISortByObjectSorter<T>[]):T[] {
        return sort(1, ctx, sortBy, comparer);
      },
    };
  };
}

export default createSortInstance({
  delegateOrderApplyingToComparer: true,
  comparer(a, b, direction:number):number {
    if (a < b) return -direction;
    if (a === b) return 0;
    if (a == null) return 1;
    if (b == null) return -1;

    return direction;
  },
});
