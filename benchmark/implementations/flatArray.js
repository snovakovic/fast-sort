const fastSort = require('fast-sort');
const arraySort = require('array-sort');
const sortArray = require('sort-array');
const lodash = require('lodash');
const latestFastSortSort = require('../../dist/sort.js');

const base = require('./base');

const sortImplementation = {
  fastSort: (arr) => fastSort(arr).asc(),
  latestFastSort: (arr) => latestFastSortSort(arr).asc(),
  lodash: (arr) => lodash.sortBy(arr),
  arraySort: (arr) => arraySort(arr),
  sortArray: (arr) => sortArray(arr),
  native: (arr) => arr.sort((a, b) => {
    if (a == null) return 1;
    if (b == null) return -1;

    if (a === b) return 0;
    if (a < b) return -1;
    return 1;
  }),
};

module.exports.run = function({
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
