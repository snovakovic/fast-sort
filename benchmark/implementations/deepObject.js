const fastSort = require('fast-sort');
const sortArray = require('sort-array');
const arraySort = require('array-sort');
const lodash = require('lodash');
const latestFastSortSort = require('../../dist/sort.js');

const base = require('./base');

const sortImplementation = {
  fastSort: (arr) => fastSort(arr).asc((p) => p.level1.level2.amount),
  latestFastSort: (arr) => latestFastSortSort(arr).asc((p) => p.level1.level2.amount),
  lodash: (arr) => lodash.sortBy(arr, [(p) => p.level1.level2.amount]),
  sortArray: (arr) => sortArray(arr, {
    by: 'amount',
    order: 'asc',
    computed: {
      amount: p => p.level1.level2.amount,
    },
  }),
  arraySort: (arr) => arraySort(arr, 'level1.level2.amount'),
  native: (arr) => arr.sort((a, b) => {
    if (a.level1.level2.amount == null) return 1;
    if (b.level1.level2.amount == null) return -1;

    if (a.level1.level2.amount === b.level1.level2.amount) return 0;
    if (a.level1.level2.amount < b.level1.level2.amount) return -1;
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
    testArr.push({
      name: 'test',
      level1: {
        level2: { amount: randomizer() },
      },
    });
  }

  return base.run({
    sortImplementation,
    testArr,
    numberOfRuns,
    librariesToRun,
  });
};
