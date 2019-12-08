// >>> HELPERS <<<

const orderHandler = (comparer) => (a, b, order) => comparer(a, b, order) * order;

const unpackObjectSorter = function(sortByObj) {
  const sortBy = (sortByObj || {}).asc || (sortByObj || {}).desc;
  if (!sortBy) {
    throw Error('Invalid sort config');
  }

  const order = sortByObj.asc ? 1 : -1;
  const comparer = sortByObj.comparer && orderHandler(sortByObj.comparer);

  return { order, sortBy, comparer };
};

// >>> SORTERS <<<

const multiPropertySorter = function(sortBy, sortByArray, depth, order, comparer, a, b) {
  let valA;
  let valB;

  if (typeof sortBy === 'string') {
    valA = a[sortBy];
    valB = b[sortBy];
  } else if (typeof sortBy === 'function') {
    valA = sortBy(a);
    valB = sortBy(b);
  } else {
    const objectSorterConfig = unpackObjectSorter(sortBy);
    return multiPropertySorter(
      objectSorterConfig.sortBy,
      sortByArray,
      depth,
      objectSorterConfig.order,
      objectSorterConfig.comparer || comparer,
      a,
      b,
    );
  }

  const equality = comparer(valA, valB, order);

  if (
    sortByArray.length > depth &&
    (equality === 0 || (valA == null && valB == null))
  ) {
    return multiPropertySorter(sortByArray[depth], sortByArray, depth + 1, order, comparer, a, b);
  }

  return equality;
};

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
    sorter = (a, b) => comparer(a[sortBy], b[sortBy], order);
  } else if (typeof sortBy === 'function') {
    sorter = (a, b) => comparer(sortBy(a), sortBy(b), order);
  } else if (Array.isArray(sortBy)) {
    sorter = multiPropertySorter.bind(undefined, sortBy[0], sortBy, 1, order, comparer);
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

export interface ISortComparer {
  comparer?(a:any, b:any, order:1|-1):number,
}

export interface ISortByAscSorter<T> extends ISortComparer {
  asc:boolean|ISortBy<T>,
}

export interface ISortByDescSorter<T> extends ISortComparer {
  desc:boolean|ISortBy<T>,
}

export type ISortByObjectSorter<T> = ISortByAscSorter<T>|ISortByDescSorter<T>;

function createSortInstance(opts:ISortComparer) {
  const comparer = orderHandler(opts.comparer);

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

const defaultSort = createSortInstance({
  comparer(a, b, order):number {
    if (a == null) return order;
    if (b == null) return -order;
    if (a < b) return -1;
    if (a === b) return 0;

    return 1;
  },
});

// Attach createNewInstance to sort function

defaultSort['createNewInstance'] = createSortInstance;

type ISortFunction = typeof defaultSort;

interface ISortExport extends ISortFunction {
  createNewInstance:typeof createSortInstance,
}

export default defaultSort as any as ISortExport;
