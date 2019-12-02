const runner = require('./../runner');

module.exports.run = function({
  sortImplementation,
  testArr,
  numberOfRuns,
  flockOnly,
}) {
  // Control array to make sure that all implementation have sorted arrays correctly
  const controlArr = sortImplementation.flock([...testArr]);
  const run = runner.bind(undefined, testArr, controlArr, numberOfRuns);

  if (flockOnly) {
    return {
      flock: run(sortImplementation.flock),
      latestFlock: run(sortImplementation.latestFlock),
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
