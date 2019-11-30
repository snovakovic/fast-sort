/* eslint-disable no-console, global-require, import/no-extraneous-dependencies, import/no-dynamic-require */

process.chdir(__dirname); // Enable running from package script

const assert = require('assert');
const exec = require('child_process').exec;

function run(err) {
  if (err) {
    console.error('Problem with installing fast-sort aborting execution', err);
    return;
  }

  const sortDefault = require('fast-sort');
  const sortEs6 = require('fast-sort/sort');
  const sortEs5 = require('fast-sort/sort.es5');
  const sortEs5Min = require('fast-sort/sort.es5.min');

  // sort
  assert.deepEqual(sortDefault([1, 4, 3]).asc(), [1, 3, 4]);
  assert.deepEqual(sortEs6([1, 4, 3]).asc(), [1, 3, 4]);
  assert.deepEqual(sortEs5([1, 4, 3]).asc(), [1, 3, 4]);
  assert.deepEqual(sortEs5Min([1, 4, 3]).asc(), [1, 3, 4]);
  console.log('sort: SUCCESS');
}

exec('npm uninstall fast-sort && npm install --no-save fast-sort', run);
