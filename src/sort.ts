// >>> HELPERS <<<

const orderHandler = (comparer) => (a, b, order) => comparer(a, b, order) * order;

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

// >>> SORTERS <<<

const multiPropertySort = function(sortBy, thenBy, depth, order, comparer, a, b) {
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
    return multiPropertySort(
      objectSorterConfig.sortBy,
      thenBy,
      depth,
      objectSorterConfig.order,
      objectSorterConfig.comparer || comparer,
      a,
      b,
    );
  }

  const equality = comparer(valA, valB, order);

  if (
    thenBy.length > depth &&
    (equality === 0 || (valA == null && valB == null))
  ) {
    return multiPropertySort(thenBy[depth], thenBy, depth + 1, order, comparer, a, b);
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
    sorter = multiPropertySort.bind(undefined, sortBy.shift(), sortBy, 0, order, comparer);
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
