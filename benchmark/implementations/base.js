const runner = require('./../runner');

// Measure times

module.exports.run = function({ sortImplementation, testArr, numberOfRuns, flockOnly }) {
  // Assert that sort of all implementations match control array
  const controlArr = sortImplementation.flock([...testArr]);
  const run = runner.bind(undefined, testArr, controlArr, numberOfRuns);

  if (flockOnly) {
    return {
      flock: run(sortImplementation.flock),
      latestFlock: run(sortImplementation.latestFlock)
    };
  }

  const results = {};
  Object
    .keys(sortImplementation)
    .forEach((key) => {
      results[key] = run(sortImplementation[key]);
    });

  return results;
};
