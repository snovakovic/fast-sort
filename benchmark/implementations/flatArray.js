
const jsFlock = require('js-flock');
const latestFlockSort = require('../../dist/sort.js');
const arraySort = require('array-sort');
const lodash = require('lodash');

const base = require('./base');

const implementations = {
  flock: (arr) => jsFlock.sort(arr).asc(),
  latestFlock: (arr) => latestFlockSort(arr).asc(),
  lodash: (arr) => lodash.sortBy(arr),
  arraySort: (arr) => arraySort(arr),
  native: (arr) =>
    arr.sort((a, b) => {
      if (a == null) return 1;
      if (b == null) return -1;

      if (a === b) return 0;
      if (a < b) return -1;
      return 1;
    })
};

// Measure times

module.exports.run = function({ size, noRuns, flockOnly, randomizer = Math.random }) {
  const testArr = [];
  for (let i = 0; i < size; i++) { // eslint-disable-line no-plusplus
    testArr.push(randomizer());
  }

  const controlArr = implementations.flock(testArr.slice(0));
  return base.run(implementations, testArr, controlArr, noRuns, flockOnly);
};
