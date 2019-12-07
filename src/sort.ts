// >>> SORTERS <<<

const stringSorter = function(order, sortBy, comparer, a, b) {
  return comparer(a[sortBy], b[sortBy], order);
};

const functionSorter = function(order, sortBy, comparer, a, b) {
  return comparer(sortBy(a), sortBy(b), order);
};

const multiPropFunctionSorter = function(sortBy, thenBy, depth, order, comparer, a, b) {
  return multiPropEqualityHandler(sortBy(a), sortBy(b), thenBy, depth, order, comparer, a, b);
};

const multiPropStringSorter = function(sortBy, thenBy, depth, order, comparer, a, b) {
  return multiPropEqualityHandler(a[sortBy], b[sortBy], thenBy, depth, order, comparer, a, b);
};

const multiPropObjectSorter = function(sortByObj, thenBy, depth, _direction, comparer, a, b) {
  const { sortBy, order, comparer: objComparer } = unpackObjectSorter(sortByObj);
  const multiSorter = getMultiPropertySorter(sortBy);
  return multiSorter(sortBy, thenBy, depth, order, objComparer || comparer, a, b);
};

// >>> HELPERS <<<

const orderHandler = (comparer) => (a, b, order) => comparer(a, b, order) * order;

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

const multiPropEqualityHandler = function(valA, valB, thenBy, depth, order, comparer, a, b) {
  const equality = comparer(valA, valB, order);
  if (
    thenBy.length > depth &&
    (equality === 0 || (valA == null && valB == null))
  ) {
    const multiSorter = getMultiPropertySorter(thenBy[depth]);
    return multiSorter(thenBy[depth], thenBy, depth + 1, order, comparer, a, b);
  }

  return equality;
};

const unpackObjectSorter = function(sortByObj) {
  const sortBy = (sortByObj || {}).asc || (sortByObj || {}).desc;
  if (!sortBy) {
    throw Error('Invalid sort config');
  }

  const order = sortByObj.asc ? 1 : -1;
  const comparer = sortByObj.comparer
    ? orderHandler(sortByObj.comparer)
    : undefined;

  return { order, sortBy, comparer };
};

/**
 * Pick sorter based on provided sortBy configuration.
 */
const sort = function(order, ctx, sortBy, comparer) {
  if (!Array.isArray(ctx)) {
    return ctx;
  }

  // Unwrap sortBy if array with only 1 value
  if (Array.isArray(sortBy) && sortBy.length < 2) {
    [sortBy] = sortBy;
  }

  let sorter;
  if (sortBy === undefined || sortBy === true) {
    sorter = (a, b) => comparer(a, b, order);
  } else if (typeof sortBy === 'string') {
    sorter = stringSorter.bind(undefined, order, sortBy, comparer);
  } else if (typeof sortBy === 'function') {
    sorter = functionSorter.bind(undefined, order, sortBy, comparer);
  } else if (Array.isArray(sortBy)) {
    sorter = getMultiPropertySorter(sortBy[0])
      .bind(undefined, sortBy.shift(), sortBy, 0, order, comparer);
  } else {
    const objectSorterConfig = unpackObjectSorter(sortBy);
    return sort(
      objectSorterConfig.order,
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
  comparer?(a:any, b:any, order:number):number,
}

export interface ISortByAscSorter<T> extends ICustomComparer {
  asc:boolean|ISortBy<T>,
}

export interface ISortByDescSorter<T> extends ICustomComparer {
  desc:boolean|ISortBy<T>,
}

export type ISortByObjectSorter<T> = ISortByAscSorter<T>|ISortByDescSorter<T>;

export interface ICreateSortInstanceOptions extends ICustomComparer {
  // Delegate applying of correct order to comparer function
  preventDefaultOrderHandling?:boolean,
}

export function createSortInstance(opts:ICreateSortInstanceOptions) {
  const comparer = opts.preventDefaultOrderHandling
    ? opts.comparer
    : orderHandler(opts.comparer);

  return function<T>(ctx:T[]) {
    return {
      /**
       * Sort array in ascending order. Mutates provided array by sorting it.
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
       * Sort array in descending order. Mutates provided array by sorting it.
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
       * Sort array in ascending or descending order. It allows sorting on multiple props
       * in different order for each of them. Mutates provided array by sorting it.
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
  preventDefaultOrderHandling: true,
  comparer(a, b, order:number):number {
    if (a < b) return -order;
    if (a === b) return 0;
    if (a == null) return 1;
    if (b == null) return -1;

    return order;
  },
});
