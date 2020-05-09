// >>> HELPERS <<<

const orderHandler = (comparer) => (a, b, order) => comparer(a, b, order) * order;

const throwInvalidConfigErrorIfTrue = function(condition:boolean, context:string) {
  if (condition) throw Error(`Invalid sort config: ${context}`);
};

const unpackObjectSorter = function(sortByObj) {
  const { asc, desc } = sortByObj || {};
  const order = asc ? 1 : -1;
  const sortBy = asc || desc;

  // Validate object config
  throwInvalidConfigErrorIfTrue(!sortBy, 'Expected `asc` or `desc` property');
  throwInvalidConfigErrorIfTrue(asc && desc, 'Ambiguous object with `asc` and `desc` config properties');

  const comparer = sortByObj.comparer && orderHandler(sortByObj.comparer);
  return { order, sortBy, comparer };
};

// >>> SORTERS <<<

const multiPropertySorterProvider = function(defaultComparer) {
  return function multiPropertySorter(sortBy, sortByArray, depth, order, comparer, a, b) {
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
        objectSorterConfig.comparer || defaultComparer,
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
};

function getSortStrategy(order, sortBy, comparer) {
  // Flat array sorter
  if (sortBy === undefined || sortBy === true) {
    return (a, b) => comparer(a, b, order);
  }

  // Sort list of objects by single string key
  if (typeof sortBy === 'string') {
    throwInvalidConfigErrorIfTrue(sortBy.includes('.'), 'String syntax not allowed for nested properties.');
    return (a, b) => comparer(a[sortBy], b[sortBy], order);
  }

  // Sort list of objects by single function sorter
  if (typeof sortBy === 'function') {
    return (a, b) => comparer(sortBy(a), sortBy(b), order);
  }

  // Sort by multiple properties
  if (Array.isArray(sortBy)) {
    return multiPropertySorterProvider(comparer)
      .bind(undefined, sortBy[0], sortBy, 1, order, comparer);
  }

  // Unpack object config to get actual sorter
  const objectSorterConfig = unpackObjectSorter(sortBy);
  return getSortStrategy(
    objectSorterConfig.order,
    objectSorterConfig.sortBy,
    objectSorterConfig.comparer || comparer,
  );
}

const sort = function(order, ctx, sortBy, comparer) {
  if (!Array.isArray(ctx)) {
    return ctx;
  }

  // Unwrap sortBy if array with only 1 value to get faster sort path
  if (Array.isArray(sortBy) && sortBy.length < 2) {
    [sortBy] = sortBy;
  }

  return ctx.sort(getSortStrategy(order, sortBy, comparer));
};

// >>> PUBLIC <<<

export interface ISortByFunction<T> {
  (prop:T):any,
}

export type ISortBy<T> = keyof T|ISortByFunction<T>|(keyof T|ISortByFunction<T>)[];

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
       * sort(users).asc(u => u.firstName);
       * sort(users).asc([
       *   U => u.firstName
       *   u => u.lastName,
       * ]);
       */
      asc(sortBy?:ISortBy<T>|ISortBy<T>[]):T[] {
        return sort(1, ctx, sortBy, comparer);
      },
      /**
       * Sort array in descending order. Mutates provided array by sorting it.
       * @example
       * sort([3, 1, 4]).desc();
       * sort(users).desc(u => u.firstName);
       * sort(users).desc([
       *   U => u.firstName
       *   u => u.lastName,
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
       *  { asc: u => u.score }
       *  { desc: u => u.age }
       * ]);
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
