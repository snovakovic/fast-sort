/* eslint-disable no-console, global-require, import/no-extraneous-dependencies, import/no-dynamic-require */

process.chdir(__dirname); // Enable running from package script

const assert = require('assert');
const { exec } = require('child_process');

// Just sanity checks to ensure dist is not broken
// For more detail unit tests check sort.spec.js
function runTests({ sort }) {
  assert.deepStrictEqual(sort([1, 4, 2]).asc(), [1, 2, 4]);
  assert.deepStrictEqual(sort([1, 4, 2]).by({ asc: true }), [1, 2, 4]);
  assert.deepStrictEqual(sort([1, 4, 2]).desc(), [4, 2, 1]);
  assert.deepStrictEqual(sort([1, 4, 2]).by({ desc: true }), [4, 2, 1]);
}

function run(err) {
  if (err) {
    console.error('Problem with installing fast-sort aborting execution', err);
    return;
  }

  runTests(require('fast-sort'));
  runTests(require('fast-sort/dist/sort.min'));

  console.log('npm integration test success');
}

exec('npm uninstall fast-sort && npm install --no-save fast-sort', run);
