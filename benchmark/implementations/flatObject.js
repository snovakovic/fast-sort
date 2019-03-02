const jsFlock = require('js-flock');
const latestFlockSort = require('../../dist/sort.js');
const sortArray = require('sort-array');
const arraySort = require('array-sort');
const lodash = require('lodash');

const base = require('./base');

const sortImplementation = {
  flock: (arr) => jsFlock.sort(arr).asc('amount'),
  latestFlock: (arr) => latestFlockSort(arr).asc('amount'),
  lodash: (arr) => lodash.sortBy(arr, [(p) => p.amount]),
  sortArray: (arr) => sortArray(arr, 'amount'),
  arraySort: (arr) => arraySort(arr, 'amount'),
  native: (arr) =>
    arr.sort((a, b) => {
      if (a.amount == null) return 1;
      if (b.amount == null) return -1;

      if (a.amount === b.amount) return 0;
      if (a.amount < b.amount) return -1;
      return 1;
    })
};

module.exports.run = function({ size, numberOfRuns, flockOnly, randomizer = Math.random }) {
  const testArr = [];
  for (let i = 0; i < size; i++) {
    testArr.push({
      name: 'test',
      amount: randomizer()
    });
  }

  return base.run({ sortImplementation, testArr, numberOfRuns, flockOnly });
};
