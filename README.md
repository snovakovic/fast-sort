# fast-sort

[![Total Downloads](https://img.shields.io/npm/dt/fast-sort.svg)](https://img.shields.io/npm/dt/fast-sort.svg)
[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://opensource.org/)
[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)

[![NPM Package](https://nodei.co/npm/fast-sort.png)](https://www.npmjs.com/package/fast-sort)

Fast easy to use and flexible sorting with TypeScript support.
For speed comparison of `fast-sort` vs other popular sort libraries check [benchmark](#benchmark) section.
For list of all available features check [highlights](#highlights) section.

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

### Highlights

* Sort flat arrays
* Sort array of objects by one or more properties
* Sort in multiple directions
* [Natural sort](#natural-sorting-/-language-sensitive-sorting) support
* Support for [custom sort](#custom-sorting) instances
* Easy to read syntax
* [Faster](#benchmark) than other popular sort alternatives
* Undefined and null values are always sorted to bottom (with option to override)
* TypeScript support
* Small footprint with 0 dependencies (~ 1.4 kb minified)

Under the hood sort is using [native JavaScript sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort).
Usage of native sort implies that sorting is not necessarily [stable](https://en.wikipedia.org/wiki/Sorting_algorithm#Stability) and it also implies that input array is modified(sorted) same as it would be when applying native sort.

### More examples

* `asc` / `desc` sorters. In below examples we will use `asc` sorter but keep in mind that both `asc` and `desc` sorters have exactly the same API so all the examples below can be applied for `desc` sorter.

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
  // NOTE: we can't use string shorthand for nested properties('address.city' is not valid syntax)
  sort(users).asc(u => u.address.city);

  // Sort by multiple properties
  sort(users).asc([
    u => u.age,
    u => u.firstName
  ]);

  // Same as above but using string shorthand
  sort(users).asc(['age', 'firstName']);
```

* `by` sorter can do anything that `asc` / `desc` sorters can with addition to some more advance
  sort handling. With `by` sorter we can sort by multiple properties.
  We can also override default `comparer` for e.g natural sort purposes
  (for example on overriding default `comparer` check natural sort section).

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

### Natural sorting / Language sensitive sorting

By default `fast-sort` is not doing language sensitive sorting of strings.
e.g `image-11.jpg` will be sorted before `image-2.jpg` (in ascending sorting).
If we want to have natural sorting of strings where `image-11.jpg`
will be sorted after `image-2.jpg` (in ascending order) we can ether create new sort instance
or override default `comparer` with `by` sorter and provide it e.g
[Intl.Collator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Collator) comparer. Check the code below for both examples.
Keep in mind that natural sort is slower then default sorting so recommendation is to use it
only when needed and not for every sorting.

```javascript
  import sort from 'fast-sort';

  const testArr = ['image-2.jpg', 'image-11.jpg', 'image-3.jpg'];

  // By default fast-sort is not doing natural sort
  sort(testArr).desc(); // => ['image-3.jpg', 'image-2.jpg', 'image-11.jpg']

  // We can use `by` sort to override default comparer with the one that do language sensitive comparison
  sort(testArr).by({
    desc: true,
    comparer: new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare,
  }); // => ['image-11.jpg', 'image-3.jpg', 'image-2.jpg']


  // If we want to reuse natural sort in multiple places we can create new sort instance
  const naturalSort = sort.createNewInstance({
    comparer: new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare,
  });

  naturalSort(testArr).asc(); // => ['image-2.jpg', 'image-3.jpg', 'image-11.jpg']
  naturalSort(testArr).desc(); // => ['image-11.jpg', 'image-3.jpg', 'image-2.jpg']
```

### Custom sorting

Fast sort can be tailored to fit any sorting need or use case by creating custom sorting instances or
overriding default comparer in `by` sorter or with handling through callback functions. For example we will sort
tags by specific tag value with creating new instance and with callback function to give idea of different
possibilities.

```javascript
    import sort from 'fast-sort';

    const tagsImportance = { vip: 3, influencer: 2, captain: 1 }; // Map of custom tag values
    const tags = ['influencer', 'unknown', 'vip', 'captain'];

    // Sort tags in ascending order by custom tags values
    sort(tags).asc(tag => tagImportance[tag] || 0); // => ['unknown', 'captain', 'influencer', 'vip'];
    sort(tags).desc(tag => tagImportance[tag] || 0); // => ['vip', 'influencer', 'captain', 'unknown'];

    // If we are going ot use tags sorter in multiple places we can create specialized tagsSorter instance
    const tagSorter = sort.createNewInstance({
      comparer: (a, b) => (tagImportance[a] || 0) - (tagImportance[b] || 0)
    });

    tagSorter(tags).asc(); // => ['unknown', 'captain', 'influencer', 'vip'];
    tagSorter(tags).desc(); // => ['vip', 'influencer', 'captain', 'unknown'];

    // Note if we use default sort it will perform default string sorting
    sort(tags).asc(); // => ['captain', 'influencer', 'unknown' 'vip']
```

* Things to know

```javascript
  // Sorting values that are not sortable will return same value back
  sort(null).asc(); // => null
  sort(33).desc(); // => 33

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

  // If object config is not provided to `by` sorter it will behave exactly
  // the same as when using `asc` sorter.
  // NOTE: Note recommended to use by sorter like this as that can change down the line
  sort([1, 4, 2]).by(); // => [1, 2, 4] same as when we use `asc` sorter
  sort(users).by('firstName'); // same as doing sort(users).asc('firstName')

  // We can override default comparer just for some properties
  sort(users).by([
    { asc: 'age' },
    {
      desc: 'profileImage',
      comparer: new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare,
    },
  ]);
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
