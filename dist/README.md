# fast-sort

[![Build Status](https://travis-ci.org/snovakovic/js-flock.svg?branch=master)](https://travis-ci.org/snovakovic/js-flock)
[![Code quality](https://api.codacy.com/project/badge/grade/fe5f8741eaed4c628bca3761c32c3b68)](https://www.codacy.com/app/snovakovic/js-flock/dashboard?bid=4653162)
[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/f0ea30fd63bd4bc88ea3b0965094ced1)](https://www.codacy.com/app/snovakovic/js-flock?utm_source=github.com&utm_medium=referral&utm_content=snovakovic/js-flock&utm_campaign=Badge_Coverage)
[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://opensource.org/)
[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)

[![NPM Package](https://nodei.co/npm/fast-sort.png)](https://www.npmjs.com/package/fast-sort)


Blazing fast array sorting. **~2x faster than lodash sort**. Benchmark results coming soon.

fast-sort is part of [js-flock](https://www.npmjs.com/package/js-flock) library exported as single module. For source code and bug/issue reporting visit [js-flock](https://www.npmjs.com/package/js-flock) github page.


### Usage

Small wrapper around sort to make sorting more readable and easier to write.

* Undefined and null values are always sorted to bottom of list no matter if ordering is ascending or descending.
* Supports sorting by multiple properties
* Mutates input array in a same way as native [Array.prototype.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort).


```javascript
  import sort from 'fast-sort';

  sort([1,4,2]).asc(); // sort array in ascending order [1, 2, 4]
  sort([1,4,2]).desc(); // sort array in descending order [4, 2, 1]

  // Sort persons [Object] ascending by lowercase firstName
  sort(persons).asc((p) => p.firstName.toLowerCase());

  // Sort persons by multiple properties
  sort(persons).desc([
    (p) => p.firstName, // Sort by first name
    (p) => p.lastName, // Persons that have same firstName will be sorted by lastName
    (p) => p.dob // Persons that have same firstName and lastName will be sorted by dob
  ]);

  // Sorting values that are not sortable will return same value back
  sort(null).asc(); // => null
  sort(33).desc(); // => 33
```

### Including module

```javascript
  // npm install fast-sort --save
  import sort from 'fast-sort'; // Loads unmodified es6 code
  import sort from 'fast-sort/sort.es5'; // Loads transpiled es5 code
  import sort from 'fast-sort/sort.es5.min'; // Loads transpiled minified es5 code


  // We can import same module through js-flock library

  // npm install js-flock --save
  import sort from 'js-flock/sort'; // === import sort from 'fast-sort';
  import sort from 'js-flock/es5/sort'; // === import sort from 'fast-sort/sort.es5';
  import sort from 'js-flock/es5/sort.min'; // === import sort from 'fast-sort/sort.es5.min';
```
