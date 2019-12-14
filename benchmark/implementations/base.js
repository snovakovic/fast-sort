const runner = require('./../runner');

module.exports.run = function({
  sortImplementation,
  testArr,
  numberOfRuns,
  fastSortOnly,
}) {
  // Control array to make sure that all implementation have sorted arrays correctly
  const controlArr = sortImplementation.fastSort([...testArr]);
  const run = runner.bind(undefined, testArr, controlArr, numberOfRuns);

  if (fastSortOnly) {
    return {
      fastSort: run(sortImplementation.fastSort),
      latestFastSort: run(sortImplementation.latestFastSort),
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
