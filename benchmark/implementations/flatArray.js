const fastSort = require('fast-sort');
const arraySort = require('array-sort');
const lodash = require('lodash');
const latestFastSortSort = require('../../dist/sort.js');

const base = require('./base');

const sortImplementation = {
  fastSort: (arr) => fastSort(arr).asc(),
  latestFastSort: (arr) => latestFastSortSort(arr).asc(),
  lodash: (arr) => lodash.sortBy(arr),
  arraySort: (arr) => arraySort(arr),
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
  fastSortOnly,
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
    fastSortOnly,
  });
};
