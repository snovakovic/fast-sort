const runner = require('./../runner');

// Measure times

module.exports.run = function(impl, testArr, controlArr, numberOfRuns, flockOnly) {
  const run = runner.bind(undefined, testArr, controlArr, numberOfRuns);

  const output = {
    flock: impl.flock ? run(impl.flock) : undefined
  };

  if (flockOnly) {
    return Object.assign(output, {
      latestFlock: impl.latestFlock ? run(impl.latestFlock) : undefined
    });
  }

  return Object.assign(output, {
    lodash: impl.lodash ? run(impl.lodash) : undefined,
    sortArray: impl.sortArray ? run(impl.sortArray) : undefined,
    arraySort: impl.arraySort ? run(impl.arraySort) : undefined,
    native: impl.native ? run(impl.native) : undefined
  });
};
