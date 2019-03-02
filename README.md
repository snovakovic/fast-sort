# fast-sort

[![Build Status](https://travis-ci.org/snovakovic/js-flock.svg?branch=master)](https://travis-ci.org/snovakovic/js-flock)
[![Code quality](https://api.codacy.com/project/badge/grade/fe5f8741eaed4c628bca3761c32c3b68)](https://www.codacy.com/app/snovakovic/js-flock/dashboard?bid=4653162)
[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/f0ea30fd63bd4bc88ea3b0965094ced1)](https://www.codacy.com/app/snovakovic/js-flock?utm_source=github.com&utm_medium=referral&utm_content=snovakovic/js-flock&utm_campaign=Badge_Coverage)
[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://opensource.org/)
[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)

[![NPM Package](https://nodei.co/npm/fast-sort.png)](https://www.npmjs.com/package/fast-sort)


Blazing fast array sorting that **outperforms other popular sort libraries even up to 20x.**
Take a look at the benchmark section for more information about performance.

### Quick example

```javascript
  // Sort flat array
  sort([1,4,2]).asc(); // => [1, 2, 4]

  // Sort array of objects
  sort(users).desc(u => u.firstName);

  // Sort on multiple properties
  sort(users).asc([
    u => u.firstName,
    u => u.lastName
  ]);

  // Sort in multiple directions
  sort(users).by([
    { asc: u => u.name },
    { desc: u => u.age }
  ]);
```

### Fast sort highlights

* Sort array of objects by one or more properties
* Sort flat arrays
* Sort in multiple directions
* Easy to read syntax
* Faster than other popular sort alternatives
* Undefined and null values are always sorted to bottom

Under the hood sort use a [native JavaScript sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort).
Usage of native sort implies that sorting is not necessarily [stable](https://en.wikipedia.org/wiki/Sorting_algorithm#Stability) and it also implies that input array is modified(sorted) same as it would be when applying native sort.

### Example

```javascript
  import sort from 'fast-sort';

  sort([1,4,2]).asc(); // => [1, 2, 4]
  sort([1,4,2]).desc(); // => [4, 2, 1]

  // Sort users Object[] ascending by firstName
  sort(users).asc(u => u.firstName);

  // If sorting by single property we can use string syntax
  // NOTE: sorting by string is available from version [1.3.0]
  sort(users).asc('firstName');

  // For sorting by nested property we have to provide sort function
  sort(users).desc(u => u.address.city);

  // Sort users by firstName, lastName and city
  sort(users).desc([
    'firstName',
    'lastName',
    u => u.address.city // String syntax is not available for nested properties
  ]);

  // Sort in multiple directions
  // NOTE: Available from version [1.5.0]
  sort(users).by([
    { asc: 'name' },
    { desc: 'age' }
  ]);

  // Sort by any custom logic e.g sort vip users first
  sort(users).asc(u => u.tags === 'vip' ? 1 : -1);

  // Sorting values that are not sortable will return same value back
  sort(null).asc(); // => null
  sort(33).desc(); // => 33

  // By default sort is mutating input array,
  const arr = [1, 4, 2];
  const sortedArr = sort(arr).asc();
  console.log(arr); // => [1, 2, 4]

  // We can easily prevent mutating of input array by using ES6 spread operator
  const arr = [1, 4, 2];
  const sortedArr = sort([...arr]).asc();
  console.log(arr); // => [1, 4, 2]
  console.log(sortedArr); // => [1, 2, 4]
```

NOTE: fast-sort is part of [js-flock](https://www.npmjs.com/package/js-flock) library exported as single module.


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
