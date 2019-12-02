const assert = require('assert');

module.exports = function(arr, controlArr, numberOfRuns, sortImplementation) {
  const times = [];
  const { length } = arr;
  assert.equal(arr.length, controlArr.length, 'control array does not match test array');

  for (let i = 0; i < numberOfRuns; i++) {
    const arrToSort = [...arr];
    const start = process.hrtime();
    const sorted = sortImplementation(arrToSort);
    const end = process.hrtime(start);

    const seconds = end[0];
    const ms = end[1] / 1000000;
    times.push((seconds * 1000) + ms);

    try {
      assert.deepEqual(sorted[0], controlArr[0], 'First value does not match');
      assert.deepEqual(sorted[length / 2], controlArr[length / 2], 'Middle value does not match');
      assert.deepEqual(sorted[length - 1], controlArr[length - 1], 'Last value does not match');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('rr', err);
    }
  }

  return {
    max: Math.max(...times),
    min: Math.min(...times),
    average: times.reduce((sum, val) => sum + val, 0) / times.length,
    noOfRuns: times.length,
    arraySize: length,
  };
};
