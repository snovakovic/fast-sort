import fastSort from 'fast-sort';
import arraySort from 'array-sort';
import lodash from 'lodash';
import sortArray from 'sort-array';
import sortOn from 'sort-on';
import getRandomInt from '../getRandomInt.js';
import latestFastSortSort from '../../dist/sort.js';

import * as base from './base.js';

const sortImplementation = {
  fastSort: (arr) => fastSort.sort(arr).asc([
    (p) => p.am1,
    (p) => p.am2,
  ]),
  latestFastSort: (arr) => latestFastSortSort.sort(arr).asc([
    (p) => p.am1,
    (p) => p.am2,
  ]),
  lodash: (arr) => lodash.sortBy(arr, [
    (p) => p.am1,
    (p) => p.am2,
  ]),
  arraySort: (arr) => arraySort(arr, 'am1', 'am2'),
  sortArray: (arr) => sortArray(arr, {
    by: ['am1', 'am2'],
  }),
  sortOn: (arr) => sortOn(arr, ['am1', 'am2']),
};

export function run({ size, numberOfRuns, librariesToRun }) {
  const testArr = [];
  for (let i = 0; i < size; i++) {
    testArr.push({
      name: 'test',
      am1: getRandomInt(1, 20),
      am2: Math.random(),
    });
  }

  return base.run({
    sortImplementation,
    testArr,
    numberOfRuns,
    librariesToRun,
  });
};
