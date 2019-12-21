/* eslint-disable no-console */

const chalk = require('chalk');
const Table = require('cli-table2');
const log = require('single-line-log').stdout;

const getRandomInt = require('./getRandomInt');
const flatObject = require('./implementations/flatObject.js');
const deepObject = require('./implementations/deepObject.js');
const multiProperty = require('./implementations/multiProperty.js');
const flatArray = require('./implementations/flatArray.js');

const librariesToRun = [
  'fastSort',
  // 'latestFastSort',
  'lodash',
  'arraySort',
  'sortArray',
  'native',
];

const runConfiguration = [
  { size: 1000, numberOfRuns: 10, librariesToRun },
  { size: 5000, numberOfRuns: 50, librariesToRun },
  { size: 20000, numberOfRuns: 25, librariesToRun },
  { size: 100000, numberOfRuns: 5, librariesToRun },
];

const headerItems = [chalk.hex('f49b42')('Library')];
headerItems.push(...runConfiguration.map((c) => chalk.hex('f49b42')(`${c.size} items`)));

function getRowValue(name, run) {
  if (!run[name]) {
    return chalk.red('NOT SUPPORTED');
  }

  const fastSort = run.fastSort.average;
  const lib = run[name].average;
  let comparison = '';
  if (fastSort !== lib) {
    const color = fastSort < lib ? 'red' : 'green';
    const comparedTofastSort = (Math.max(fastSort, lib) / Math.min(fastSort, lib)).toFixed(2);
    comparison = chalk[color](`${fastSort < lib ? '↓' : '↑'} ${comparedTofastSort}x `);
    comparison = `(${comparison})`;
  }

  const result = `${run[name].average.toFixed(4)}ms ${comparison}`;
  return name === 'fastSort'
    ? chalk.blue(result)
    : result;
}

function addRow(libName, result, table) {
  const value = getRowValue.bind(null, libName);

  if (libName === 'fastSort') libName = chalk.blue(libName);
  table.push([libName, ...result.map((r) => value(r))]);
}


const run = function(implementation, randomizer) {
  const res = [];

  runConfiguration.forEach((conf, idx) => {
    res.push(implementation.run(Object.assign(conf, { randomizer })));
    log(`${idx + 1}/${runConfiguration.length}`);
    log.clear();
  });

  log('');

  const table = new Table({ head: headerItems });
  librariesToRun.forEach((lib) => addRow(lib, res, table));

  console.log(table.toString());
};


console.info('\n --------------- SORT BENCHMARK ---------------');

console.info('\n Benchmark 1: Flat object high randomization \n');
run(flatObject);

// console.info('\n Benchmark 2: Flat object low randomization \n');
run(flatObject, () => getRandomInt(1, 5));

// console.log('\n Benchmark 3: Flat array high randomization \n');
run(flatArray);

console.log('\n Benchmark 4: Deep nested properties high randomization \n');
run(deepObject);

console.log('\n Benchmark 5: Multi property sort low randomization \n');
run(multiProperty);
