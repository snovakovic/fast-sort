/* eslint-disable no-console */

const chalk = require('chalk');
const minimist = require('minimist');
const Table = require('cli-table2');
const log = require('single-line-log').stdout;

const getRandomInt = require('./getRandomInt');
const flatObject = require('./implementations/flatObject.js');
const deepObject = require('./implementations/deepObject.js');
const multiProperty = require('./implementations/multiProperty.js');
const flatArray = require('./implementations/flatArray.js');

const argv = minimist((process.argv.slice(2)));
const flockOnly = Boolean(argv.flock);

const libraries = ['flock'];

if (flockOnly) {
  libraries.push('latestFlock');
} else {
  libraries.push('lodash', 'arraySort', 'sortArray', 'native');
}

const runConfiguration = [
  { size: 1000, numberOfRuns: 100, flockOnly },
  { size: 5000, numberOfRuns: 50, flockOnly },
  { size: 20000, numberOfRuns: 25, flockOnly },
  { size: 100000, numberOfRuns: 5, flockOnly },
];

const headerItems = [chalk.hex('f49b42')('Library')];
headerItems.push(...runConfiguration.map((c) => chalk.hex('f49b42')(`${c.size} items`)));

function getRowValue(name, run) {
  if (!run[name]) {
    return chalk.red('NOT SUPPORTED');
  }

  const flock = run.flock.average;
  const lib = run[name].average;
  let comparison = '';
  if (flock !== lib) {
    const color = flock < lib ? 'red' : 'green';
    const comparedToFlock = (Math.max(flock, lib) / Math.min(flock, lib)).toFixed(2);
    comparison = chalk[color](`${flock < lib ? '↓' : '↑'} ${comparedToFlock}x `);
    comparison = `(${comparison})`;
  }

  const result = `${run[name].average.toFixed(4)}ms ${comparison}`;
  return name === 'flock'
    ? chalk.blue(result)
    : result;
}

function addRow(libName, result, table) {
  const value = getRowValue.bind(null, libName);

  if (libName === 'flock') libName = chalk.blue(libName);
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
  libraries.forEach((lib) => addRow(lib, res, table));

  console.log(table.toString());
};


console.info('\n --------------- SORT BENCHMARK ---------------');

console.info('\n Benchmark 1: Flat object high randomization \n');
run(flatObject);

console.info('\n Benchmark 2: Flat object low randomization \n');
run(flatObject, () => getRandomInt(1, 5));

console.log('\n Benchmark 3: Flat array high randomization \n');
run(flatArray);

console.log('\n Benchmark 4: Deep nested properties high randomization \n');
run(deepObject);

console.log('\n Benchmark 5: Multi property sort low randomization \n');
run(multiProperty);
