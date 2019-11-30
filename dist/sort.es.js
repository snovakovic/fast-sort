/* eslint no-use-before-define: 0 */
// >>> SORTERS <<<
var defaultComparer = function (direction, a, b) {
    if (a === b)
        return 0;
    if (a < b)
        return -direction;
    if (a == null)
        return 1;
    if (b == null)
        return -1;
    return direction;
};
var customComparerProvider = function (comparer) {
    return function (direction, a, b) {
        return comparer(a, b) * direction;
    };
};
/**
 * stringSorter does not support nested property.
 * For nested properties or value transformation (e.g toLowerCase) we should use functionSorter
 * Based on benchmark testing using stringSorter is bit faster then using equivalent function sorter
 * @example sort(users).asc('firstName')
 */
var stringSorter = function (direction, sortBy, comparer, a, b) {
    return comparer(direction, a[sortBy], b[sortBy]);
};
/**
 * @example sort(users).asc(p => p.address.city)
 */
var functionSorter = function (direction, sortBy, comparer, a, b) {
    return comparer(direction, sortBy(a), sortBy(b));
};
/**
 * Used when we have sorting by multiple properties and when current sorter is function
 * @example sort(users).asc([p => p.address.city, p => p.firstName])
 */
var multiPropFunctionSorter = function (sortBy, thenBy, depth, direction, comparer, a, b) {
    return multiPropEqualityHandler(sortBy(a), sortBy(b), thenBy, depth, direction, comparer, a, b);
};
/**
 * Used when we have sorting by multiple properties and when current sorter is string
 * @example sort(users).asc(['firstName', 'lastName'])
 */
var multiPropStringSorter = function (sortBy, thenBy, depth, direction, comparer, a, b) {
    return multiPropEqualityHandler(a[sortBy], b[sortBy], thenBy, depth, direction, comparer, a, b);
};
/**
 * Used with 'by' sorter when we have sorting in multiple direction
 * @example sort(users).asc(['firstName', 'lastName'])
 */
var multiPropObjectSorter = function (sortByObj, thenBy, depth, _direction, _comparer, a, b) {
    var sortBy = sortByObj.asc || sortByObj.desc;
    var direction = sortByObj.asc ? 1 : -1;
    var comparer = sortByObj.comparer
        ? customComparerProvider(sortByObj.comparer)
        : defaultComparer;
    if (!sortBy) {
        throw Error("sort: Invalid 'by' sorting configuration.\n      Expecting object with 'asc' or 'desc' key");
    }
    var multiSorter = getMultiPropertySorter(sortBy);
    return multiSorter(sortBy, thenBy, depth, direction, comparer, a, b);
};
// >>> HELPERS <<<
/**
 * Return multiProperty sort handler based on sortBy value
 */
var getMultiPropertySorter = function (sortBy) {
    var type = typeof sortBy;
    if (type === 'string') {
        return multiPropStringSorter;
    }
    if (type === 'function') {
        return multiPropFunctionSorter;
    }
    return multiPropObjectSorter;
};
var multiPropEqualityHandler = function (valA, valB, thenBy, depth, direction, comparer, a, b) {
    if (valA === valB || (valA == null && valB == null)) {
        if (thenBy.length > depth) {
            var multiSorter = getMultiPropertySorter(thenBy[depth]);
            return multiSorter(thenBy[depth], thenBy, depth + 1, direction, comparer, a, b);
        }
        return 0;
    }
    return comparer(direction, valA, valB);
};
/**
 * Pick sorter based on provided sortBy value
 */
var sort = function (direction, ctx, sortBy, comparer) {
    var _a;
    if (!Array.isArray(ctx))
        return ctx;
    // Unwrap sortBy if array with only 1 value
    if (Array.isArray(sortBy) && sortBy.length < 2) {
        _a = sortBy, sortBy = _a[0];
    }
    var _sorter;
    if (!sortBy || sortBy === true) {
        _sorter = comparer.bind(undefined, direction);
    }
    else if (typeof sortBy === 'string') {
        _sorter = stringSorter.bind(undefined, direction, sortBy, comparer);
    }
    else if (typeof sortBy === 'function') {
        _sorter = functionSorter.bind(undefined, direction, sortBy, comparer);
    }
    else {
        _sorter = getMultiPropertySorter(sortBy[0])
            .bind(undefined, sortBy.shift(), sortBy, 0, direction, comparer);
    }
    return ctx.sort(_sorter);
};
// >>> PUBLIC <<<
function sort$1 (ctx) {
    return {
        asc: function (sortBy) { return sort(1, ctx, sortBy, defaultComparer); },
        desc: function (sortBy) { return sort(-1, ctx, sortBy, defaultComparer); },
        by: function (sortBy) {
            if (!Array.isArray(ctx))
                return ctx;
            var sortByInSingleDirection;
            if (!Array.isArray(sortBy)) {
                sortByInSingleDirection = sortBy;
            }
            else if (sortBy.length === 1) {
                sortByInSingleDirection = sortBy[0];
            }
            // Unwrap sort by to faster path for dedicated single direction sorters
            if (sortByInSingleDirection) {
                var direction = sortByInSingleDirection.asc ? 1 : -1;
                var singleDirectionSortBy = sortByInSingleDirection.asc || sortByInSingleDirection.desc;
                var comparer = sortByInSingleDirection.comparer
                    ? customComparerProvider(sortByInSingleDirection.comparer)
                    : defaultComparer;
                if (!singleDirectionSortBy) {
                    throw Error("sort: Invalid 'by' sorting configuration.\n            Expecting object with 'asc' or 'desc' key");
                }
                return sort(direction, ctx, singleDirectionSortBy, comparer);
            }
            var _sorter = multiPropObjectSorter
                .bind(undefined, sortBy.shift(), sortBy, 0, undefined, undefined);
            return ctx.sort(_sorter);
        }
    };
}

export default sort$1;
