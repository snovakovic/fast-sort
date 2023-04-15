# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.4.0] - 2023-04-15

### Fixed

* Issue with sorting multiple types in array (https://github.com/snovakovic/fast-sort/issues/62)

## [3.3.3] - 2023-04-15

Fix usage in TS environment with `"moduleResolution": "node16"`

## [3.3.0] - 2023-04-14

Added proper support for ESM modules

## [3.2.1] - 2023-01-06

### Added

* `defaultComparer` is now exported so it can be used for overriding of custom sort instances

## [3.1.2] - 2021-11-10

### Fixed

* Issue with sorting dates (https://github.com/snovakovic/fast-sort/issues/51)

## [3.1.0] - 2021-11-10

### Fixed

* TypeScript interface to allow sorting readonly arrays if inPlaceSorting is not used

## [3.0.0] - 2021-04-08

### Changed

* Default export has been replaced with named exports

```javascript
import sort from 'fast-sort'; // older versions

import { sort } from 'fast-sort'; // v3 and up
```

* By default `sort` no longer mutates array as was case in previous versions it now creates new array instance.

* `sort.createNewInstance` is now provided as named export

```javascript
import { createNewSortInstance } from 'fast-sort';
```

### Added

 * `inPlaceSort` mutates provided array instead of creating new array instance. This was default behaviour of previous sort versions
 * `inPlaceSorting` option that can be passed to `createNewSortInstance`.

## [2.2.0] - 2019-12-14

## [3.0.0] - 2021-04-08
### Changed

* Old `IComparer` interface has been renamed to `ISortInstanceOptions`. New `IComparer` interface is created that now describes actual comparer function

## [2.0.0] - 2019-12-14

### Added

* Option to create new custom sort instance
```javascript
  const naturalSort = sort.createNewInstance({
    comparer: new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare,
  });
```
* TypeScript support
* more info on this release on https://github.com/snovakovic/fast-sort/releases/tag/v2.0.0

## [1.6.0]

### Added

* Option to override default comparer in by sorter
```javascript
  sort(testArr).by({
    desc: true,
    comparer: new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare,
  });
```

## [1.5.0]

### Added

* Option to sort in multiple directions
```javascript
sort(users).by([{ asc: 'age' }, { desc: 'firstName' }]);
```
