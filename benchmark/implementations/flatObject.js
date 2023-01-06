import fastSort from 'fast-sort';
import sortArray from 'sort-array';
import sortOn from 'sort-on';
import arraySort from 'array-sort';
import lodash from 'lodash';
import latestFastSortSort from '../../dist/sort.js';

import * as base from './base.js';

const sortImplementation = {
  fastSort: (arr) => fastSort.sort(arr).asc('amount'),
  latestFastSort: (arr) => latestFastSortSort.sort(arr).asc('amount'),
  lodash: (arr) => lodash.sortBy(arr, [(p) => p.amount]),
  sortArray: (arr) => sortArray(arr, { by: 'amount', order: 'asc' }),
  sortOn: (arr) => sortOn(arr, 'amount'),
  arraySort: (arr) => arraySort(arr, 'amount'),
  native: (arr) => arr.sort((a, b) => {
    if (a.amount == null) return 1;
    if (b.amount == null) return -1;

    if (a.amount === b.amount) return 0;
    if (a.amount < b.amount) return -1;
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
    testArr.push({
      name: 'test',
      amount: randomizer(),
    });
  }

  return base.run({
    sortImplementation,
    testArr,
    numberOfRuns,
    librariesToRun,
  });
};
