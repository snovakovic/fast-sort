const fastSort = require('fast-sort');
const arraySort = require('array-sort');
const lodash = require('lodash');
const sortArray = require('sort-array');
const latestFastSortSort = require('../../dist/sort.js');
const getRandomInt = require('../getRandomInt');

const base = require('./base');

const sortImplementation = {
  fastSort: (arr) => fastSort(arr).asc([
    (p) => p.am1,
    (p) => p.am2,
  ]),
  latestFastSort: (arr) => latestFastSortSort(arr).asc([
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
};

module.exports.run = function({ size, numberOfRuns, librariesToRun }) {
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
