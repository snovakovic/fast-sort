# fast-sort

[![Start](https://img.shields.io/github/stars/snovakovic/fast-sort?style=flat-square)](https://github.com/snovakovic/fast-sort/stargazers)
[![Total Downloads](https://img.shields.io/npm/dt/fast-sort.svg)](https://www.npmjs.com/package/fast-sort)
[![Known Vulnerabilities](https://snyk.io/test/github/snovakovic/fast-sort/badge.svg)](https://snyk.io/test/github/snovakovic/fast-sort)
[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://opensource.org/)
[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)

[![NPM Package](https://nodei.co/npm/fast-sort.png)](https://www.npmjs.com/package/fast-sort)

Fast-sort is a lightweight (850 bytes gzip), zero-dependency sorting library with TypeScript support.
Its easy-to-use and flexible syntax, combined with [incredible speed](#benchmark) , make it a top choice for developers seeking efficient, reliable, and customizable sorting solutions.

## Quick examples

```javascript
  import { sort } from 'fast-sort';

  // Sort flat arrays
  const ascSorted = sort([1,4,2]).asc(); // => [1, 2, 4]
  const descSorted = sort([1, 4, 2]).desc(); // => [4, 2, 1]

  // Sort users (array of objects) by firstName in descending order
  const sorted = sort(users).desc(u => u.firstName);

  // Sort users in ascending order by firstName and lastName
  const sorted = sort(users).asc([
    u => u.firstName,
    u => u.lastName
  ]);

  // Sort users ascending by firstName and descending by city
  const sorted = sort(users).by([
    { asc: u => u.firstName },
    { desc: u => u.address.city }
  ]);

  // Sort based on computed property
  const sorted = sort(repositories).desc(r => r.openIssues + r.closedIssues);

  // Sort using string for object key
  // Only available for root object properties
  const sorted = sort(users).asc('firstName');
```

Fore more examples check [unit tests](https://github.com/snovakovic/fast-sort/blob/master/test/sort.spec.ts).

## In place sorting

Fast-sort provides an inPlace sorting option that mutates the original array instead of creating a new instance, resulting in marginally faster and more memory-efficient sorting. However, both the inPlaceSort and default sort methods offer exactly the same functionality.

```javascript
const { sort, inPlaceSort } = require('fast-sort');

const array = [3, 1, 5];
const sorted = sort(array).asc();

// sorted => [1, 3, 5]
// array => [3, 1, 5]

inPlaceSort(array).asc();

// array => [1, 3, 5]
```

## Natural sorting / Language sensitive sorting

By default `fast-sort` is not doing language sensitive sorting of strings.
e.g `'image-11.jpg'` will be sorted before `'image-2.jpg'` (in ascending sorting).
We can provide custom [Intl.Collator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Collator) comparer to fast-sort for language sensitive sorting of strings.
Keep in mind that natural sort is slower then default sorting so recommendation is to use it
only when needed.

```javascript
  import { sort, createNewSortInstance } from 'fast-sort';

  const testArr = ['image-2.jpg', 'image-11.jpg', 'image-3.jpg'];

  // By default fast-sort is not doing natural sort
  sort(testArr).desc(); // => ['image-3.jpg', 'image-2.jpg', 'image-11.jpg']

  // We can use `by` sort to override default comparer
  // with the one that is doing language sensitive comparison
  sort(testArr).by({
    desc: true,
    comparer: new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare,
  }); // => ['image-11.jpg', 'image-3.jpg', 'image-2.jpg']

  // Or we can create new sort instance with language sensitive comparer.
  // Recommended if used in multiple places
  const naturalSort = createNewSortInstance({
    comparer: new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare,
  });

  naturalSort(testArr).asc(); // => ['image-2.jpg', 'image-3.jpg', 'image-11.jpg']
  naturalSort(testArr).desc(); // => ['image-11.jpg', 'image-3.jpg', 'image-2.jpg']
```

NOTE: It's known that `Intl.Collator` might not sort `null` values correctly so make sure to cast them to `undefine`
as described in the following issue
https://github.com/snovakovic/fast-sort/issues/54#issuecomment-1072289388

## Custom sorting

Fast sort can be tailored to fit any sorting need or use case by:
  * creating custom sorting instances
  * overriding default comparer in `by` sorter
  * custom handling in provided callback function
  * combination of any from above

For example we will sort `tags` by "custom" tag importance (e.g `vip` tag is of greater importance then `captain` tag).

```javascript
  import { sort, createNewSortInstance } from 'fast-sort';

  const tags = ['influencer', 'unknown', 'vip', 'captain'];
  const tagsImportance = { // Domain specific tag importance
    vip: 3,
    influencer: 2,
    captain: 1,
  };

  // We can use power of computed prop to sort tags by domain specific importance
  const descTags = sort(tags).desc(tag => tagImportance[tag] || 0);
  // => ['vip', 'influencer', 'captain', 'unknown'];

  // Or we can create specialized tagSorter so we can reuse it in multiple places
  const tagSorter = createNewSortInstance({
    comparer: (a, b) => (tagImportance[a] || 0) - (tagImportance[b] || 0),
    inPlaceSorting: true, // default[false] => Check "In Place Sort" section for more info.
  });

  tagSorter(tags).asc(); // => ['unknown', 'captain', 'influencer', 'vip'];
  tagSorter(tags).desc(); // => ['vip', 'influencer', 'captain', 'unknown'];

  // Default sorter will sort tags by comparing string values not by their domain specific value
  const defaultSort = sort(tags).asc(); // => ['captain', 'influencer', 'unknown' 'vip']
```
## More examples

```javascript
  // Sorting values that are not sortable will return same value back
  sort(null).asc(); // => null
  sort(33).desc(); // => 33

  // By default fast-sort sorts null and undefined values to the
  // bottom no matter if sorting is in asc or decs order.
  // If this is not intended behaviour you can check "Should create sort instance that sorts nil value to the top in desc order" test on how to override
  const addresses = [{ city: 'Split' }, { city: undefined }, { city: 'Zagreb'}];
  sort(addresses).asc(a => a.city); // => Split, Zagreb, undefined
  sort(addresses).desc(a => a.city); // => Zagreb, Split, undefined
```

## Migrating from older versions

Documentation for v2 and older versions is available [here](https://github.com/snovakovic/fast-sort/blob/v2/README.md).


For migrating to v3 you can reference [CHANGELOG](https://github.com/snovakovic/fast-sort/blob/master/CHANGELOG.md) for what has been changed.

## Benchmark

Five different benchmarks have been created to get better insight of how fast-sort perform under different scenarios.
Each benchmark is run with different array sizes raging from small 100 items to large 100 000 items.

Every run of benchmark outputs different results but the results are constantly showing better scores compared to similar popular sorting libraries.

#### Benchmark scores

Benchmark has been run on:

  * 16 GB Ram
  * Intel® Core™ i5-4570 CPU @ 3.20GHz × 4
  * Ubuntu 16.04
  * Node 8.9.1

Independent benchmark results from MacBook Air can be found in following PR:
https://github.com/snovakovic/fast-sort/pull/48

![benchmark results](https://github.com/snovakovic/fast-sort/raw/master/benchmark.jpg)

#### Running benchmark

To run benchmark on your PC follow steps from below

1) git clone https://github.com/snovakovic/fast-sort.git
2) cd fast-sort/benchmark
3) npm install
4) npm start

In case you notice any irregularities in benchmark or you want to add sort library to benchmark score
please open issue [here](https://github.com/snovakovic/fast-sort)

