const runner = require('./../runner');

module.exports.run = function({
  sortImplementation,
  testArr,
  numberOfRuns,
  librariesToRun,
}) {
  // Control array to make sure that all implementation have sorted arrays correctly
  const controlArr = sortImplementation.fastSort([...testArr]);
  const run = runner.bind(undefined, testArr, controlArr, numberOfRuns);

  const results = {};
  Object
    .keys(sortImplementation)
    .forEach((key) => {
      if (librariesToRun.includes(key)) {
        results[key] = run(sortImplementation[key]);
      }
    });

  return results;
};
