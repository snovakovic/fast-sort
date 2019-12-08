# fast-sort

[![Total Downloads](https://img.shields.io/npm/dt/fast-sort.svg)](https://img.shields.io/npm/dt/fast-sort.svg)
[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://opensource.org/)
[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)

[![NPM Package](https://nodei.co/npm/fast-sort.png)](https://www.npmjs.com/package/fast-sort)

Fast easy to use and flexible sorting with TypeScript support.
For speed comparison of fast-sort and other popular sort libraries check benchmark section.
For list of all available features check fast-sort highlights section.

### Quick examples

```javascript
  // Sort flat arrays
  sort([1,4,2]).asc(); // => [1, 2, 4]
  sort([1, 4, 2]).desc(); // => [4, 2, 1]

  // Sort users (array of objects) by firstName in descending order
  sort(users).desc(u => u.firstName);

  // Sort users in ascending order by firstName and lastName
  sort(users).asc([
    u => u.firstName,
    u => u.lastName
  ]);

  // Sort users ascending by firstName and descending by age
  sort(users).by([
    { asc: u => u.firstName },
    { desc: u => u.age }
  ]);
```

### Fast sort highlights

* Sort flat arrays
* Sort array of objects by one or more properties
* Sort in multiple directions
* Easy to read syntax
* Faster than other popular sort alternatives
* Undefined and null values are always sorted to bottom (with option to override)
* Natural sort support
* Support for custom sort instances
* TypeScript support

Under the hood sort use a [native JavaScript sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort).
Usage of native sort implies that sorting is not necessarily [stable](https://en.wikipedia.org/wiki/Sorting_algorithm#Stability) and it also implies that input array is modified(sorted) same as it would be when applying native sort.

### Fast sort API examples

* `asc` / `desc` sorting. Both of those sorters have exactly same API. In below examples we will use `asc` sorting. To sort it in desc order jut replace `asc` with `desc`.

```javascript
  import sort from 'fast-sort';

  // Sort flat arrays
  sort([1,4,2]).asc(); // => [1, 2, 4]

  // Sort array of objects by single object property
  sort(users).asc(u => u.firstName);

  // If we are sorting by root object property we can use string shorthand (same output as above)
  // NOTE: string shorthand does not support nested object properties
  sort(users).asc('firstName');

  // Sort by nested object property
  // NOTE: we can't use string shorthand for this one. 'address.city' is not valid syntax
  sort(users).asc(u => u.address.city);

  // Sort by multiple properties
  sort(users).asc([
    u => u.age,
    u => u.firstName
  ]);

  // Same as above but using string shorthand
  sort(users).asc(['age', 'firstName']);

  // Mixin of string and function are allowed
  sort(users).desc([
    'age',
    u => u.address.city // String syntax is not available for nested properties
  ]);
```

* `by` sorting. Think of `asc` and `desc` sorters as aliases of `by` sorter. They cover most of
  the sorting requirements and they provide more compact API. `by` sorter can do everything `asc` and `desc` sorters do but it also provides a way to do more complex sorting tasks as sorting by multiple properties in multiple directions and it allows overriding of default comparer with any custom one (e.g for purpose of natural sorting)

```javascript
  import sort from 'fast-sort';

  // Sort users by name in ascending order and age in descending order
  // NOTE: Available from version [1.5.0]
  sort(users).by([
    { asc: u => u.name },
    { desc: u => u.age }
  ]);

  // Same as with asc/desc sorters we can use string shorthand for root object properties
  sort(users).by([{ asc: 'name' }, { desc: 'age' }]);
```

* Natural sort / Language sensitive sort

By default fast-sort is not doing natural-sort.
If we need natural sort we can provide custom comparer to `by` sorter or we can even create
new sort instance that will do natural sort by default.
Check [Intl.Collator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Collator)
Documentation for more info on string sensitive comparisons.

```javascript
  import sort from 'fast-sort';

  const testArr = ['A2', 'A10', 'A3'];

  // By default fast-sort is not doing natural sort
  sort(testArr).desc(); // => ['A3', 'A2', 'A10']

  // We can use `by` sort to override custom comparer with the one that use natural sort
  sort(testArr).by({
    desc: true,
    comparer: new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare,
  }); // =? ['A10', 'A3', 'A2']

  // When sorting by multiple properties we can provide custom comparer just for some properties
  // Sort by age using default sorter and by resumeLink using natural sort
  sort(users).by([
    { asc: 'age' },
    {
      desc: 'resumeLink',
      comparer: new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare,
    },
  ]);

  // Creating new instance that will do natural sort by default
  // NOTE: natural sort is slower then default sorting so recommendation is to use only when needed and not always
  const naturalSort = sort.createNewInstance({
    comparer: new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare,
  });

  naturalSort(testArr).asc(); // => ['A2', 'A3', 'A10']
  sort(testArr).asc(); // => ['A10', 'A2', 'A3']
```

* Custom sorting

Fast sort can be tailored to fit any sorting need or use case as strange as it is by creating custom sorting instances or
overriding default comparer with `by`. For example we will create custom tags sorters that gives custom value to tag

```javascript
    const tagsImportance = { vip: 3, influencer: 2, captain: 1 };
    const tags = ['influencer', 'unknown', 'vip', 'captain'];

    // Sort tags in ascending order by custom tags values
    sort(tags).asc(tag => tagImportance[tag] || 0); // => ['unknown', 'captain', 'influencer', 'vip']);

    // If we are going ot use tags sorter in multiple places we can create specialized tagsSorter sorter
    const tagSorter = sort.createNewInstance({
      comparer: (a, b) => (tagImportance[a] || 0) - (tagImportance[b] || 0)
    });

    tagSorter(tags).asc(); // => ['unknown', 'captain', 'influencer', 'vip']);
    tagSorter(tags).desc(); // => ['vip', 'influencer', 'captain', 'unknown']);
```

* Things to know

```javascript
  // Sorting values that are not sortable will return same value back
  sort(null).asc(); // => null
  sort(33).desc(); // => 33

  // If object config is not provided to `by` sorter it will behave exactly
  // the same as when suing `asc` sorter.
  // NOTE: It's not recommended for by sorter to be used in this way as that
  // that can change in the future
  sort([1, 4, 2]).by(); // => [1, 2, 4] same as when we use `asc` sorter
  sort(users).by('firstName'); // same as doing sort(users).asc('firstName')

  // By default sort is mutating input array,
  const arr = [1, 4, 2];
  const sortedArr = sort(arr).asc();
  console.log(sortedArr); // => [1, 2, 4]
  console.log(arr); // => [1, 2, 4]

  // To prevent that we can use ES6 destructor (or ES5 equivalents)
  const arr = [1, 4, 2];
  const sortedArr = sort([...arr]).asc();
  console.log(arr); // => [1, 4, 2]
  console.log(sortedArr); // => [1, 2, 4]
```

### Benchmark

Five different benchmarks have been created to get better insight of how fast-sort perform under different scenarios.
Each benchmark is run with different array sizes raging from small 100 items to large 100 000 items.

Every run of benchmark outputs different results but the results are constantly showing better scores compared to similar popular sorting libraries.


#### Benchmark scores

Benchmark has been run on:

* 16 GB Ram
* Intel® Core™ i5-4570 CPU @ 3.20GHz × 4
* Ubuntu 16.04
* Node 8.9.1

![benchmark results](https://github.com/snovakovic/fast-sort/raw/master/benchmark.jpg)


#### Running benchmark

To run benchmark on your PC follow steps from below

1) git clone https://github.com/snovakovic/fast-sort.git
2) cd fast-sort/benchmark
3) npm install
4) npm start

In case you notice any irregularities in benchmark or you want to add sort library to benchmark score
please open issue [here](https://github.com/snovakovic/fast-sort)
