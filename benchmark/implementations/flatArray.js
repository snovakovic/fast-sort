import fastSort from 'fast-sort';
import arraySort from 'array-sort';
import sortArray from 'sort-array';
import sortOn from 'sort-on';
import lodash from 'lodash';
import latestFastSortSort from '../../dist/sort.js';

import * as base from './base.js';

const sortImplementation = {
  fastSort: (arr) => fastSort.sort(arr).asc(),
  latestFastSort: (arr) => latestFastSortSort.sort(arr).asc(),
  lodash: (arr) => lodash.sortBy(arr),
  arraySort: (arr) => arraySort(arr),
  sortArray: (arr) => sortArray(arr),
  sortOn: (arr) => sortOn(arr, x => x),
  native: (arr) => arr.sort((a, b) => {
    if (a == null) return 1;
    if (b == null) return -1;

    if (a === b) return 0;
    if (a < b) return -1;
    return 1;
  }),
};

export function run({
  size,
  numberOfRuns,
  librariesToRun,
  randomizer = Math.random,
}) {
  const testArr = [];
  for (let i = 0; i < size; i++) {
    testArr.push(randomizer());
  }

  return base.run({
    sortImplementation,
    testArr,
    numberOfRuns,
    librariesToRun,
  });
};
