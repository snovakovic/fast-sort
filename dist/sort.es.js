// >>> HELPERS <<<
var orderHandler = function (comparer) { return function (a, b, order) { return comparer(a, b, order) * order; }; };
var throwInvalidConfigError = function (context) {
    throw Error("Invalid sort config: " + context);
};
var unpackObjectSorter = function (sortByObj) {
    var _a = sortByObj || {}, asc = _a.asc, desc = _a.desc;
    var order = asc ? 1 : -1;
    var sortBy = asc || desc;
    if (asc && desc) {
        throw throwInvalidConfigError('Ambiguous object with `asc` and `desc` config properties');
    }
    if (!sortBy) {
        throwInvalidConfigError('Expected `asc` or `desc` property');
    }
    var comparer = sortByObj.comparer && orderHandler(sortByObj.comparer);
    return { order: order, sortBy: sortBy, comparer: comparer };
};
// >>> SORTERS <<<
var multiPropertySorterProvider = function (defaultComparer) {
    return function multiPropertySorter(sortBy, sortByArray, depth, order, comparer, a, b) {
        var valA;
        var valB;
        if (typeof sortBy === 'string') {
            valA = a[sortBy];
            valB = b[sortBy];
        }
        else if (typeof sortBy === 'function') {
            valA = sortBy(a);
            valB = sortBy(b);
        }
        else {
            var objectSorterConfig = unpackObjectSorter(sortBy);
            return multiPropertySorter(objectSorterConfig.sortBy, sortByArray, depth, objectSorterConfig.order, objectSorterConfig.comparer || defaultComparer, a, b);
        }
        var equality = comparer(valA, valB, order);
        if (sortByArray.length > depth &&
            (equality === 0 || (valA == null && valB == null))) {
            return multiPropertySorter(sortByArray[depth], sortByArray, depth + 1, order, comparer, a, b);
        }
        return equality;
    };
};
var sort = function (order, ctx, sortBy, comparer) {
    var _a;
    if (!Array.isArray(ctx)) {
        return ctx;
    }
    // Unwrap sortBy if array with only 1 value
    if (Array.isArray(sortBy) && sortBy.length < 2) {
        _a = sortBy, sortBy = _a[0];
    }
    var sorter;
    if (sortBy === undefined || sortBy === true) {
        sorter = function (a, b) { return comparer(a, b, order); };
    }
    else if (typeof sortBy === 'string') {
        if (sortBy.includes('.')) {
            throw throwInvalidConfigError('String syntax not allowed for nested properties.');
        }
        sorter = function (a, b) { return comparer(a[sortBy], b[sortBy], order); };
    }
    else if (typeof sortBy === 'function') {
        sorter = function (a, b) { return comparer(sortBy(a), sortBy(b), order); };
    }
    else if (Array.isArray(sortBy)) {
        sorter = multiPropertySorterProvider(comparer)
            .bind(undefined, sortBy[0], sortBy, 1, order, comparer);
    }
    else {
        var objectSorterConfig = unpackObjectSorter(sortBy);
        return sort(objectSorterConfig.order, ctx, objectSorterConfig.sortBy, objectSorterConfig.comparer || comparer);
    }
    return ctx.sort(sorter);
};
function createSortInstance(opts) {
    var comparer = orderHandler(opts.comparer);
    return function (ctx) {
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
            asc: function (sortBy) {
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
            desc: function (sortBy) {
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
            by: function (sortBy) {
                return sort(1, ctx, sortBy, comparer);
            },
        };
    };
}
var defaultSort = createSortInstance({
    comparer: function (a, b, order) {
        if (a == null)
            return order;
        if (b == null)
            return -order;
        if (a < b)
            return -1;
        if (a === b)
            return 0;
        return 1;
    },
});
// Attach createNewInstance to sort function
defaultSort['createNewInstance'] = createSortInstance;

export default defaultSort;
