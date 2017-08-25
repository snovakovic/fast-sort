/* eslint-disable no-console */

const exec = require('child_process').exec;
const Fs = require('fs-extra'); // eslint-disable-line import/no-extraneous-dependencies
const Path = require('path');


const path = {
  dist: Path.resolve(__dirname, 'dist'),
  jsFlock: Path.resolve(__dirname, 'node_modules/js-flock')
};

const filesToInclude = [{
  name: 'publish.js',
  path: Path.resolve(__dirname, 'publish.js')
}, {
  name: '.npmignore',
  path: Path.resolve(__dirname, '.npmignore')
}, {
  name: 'package.json',
  path: Path.resolve(__dirname, 'package.json')
}, {
  name: 'LICENSE',
  path: Path.resolve(__dirname, 'LICENSE')
}, {
  name: 'README.md',
  path: Path.resolve(__dirname, 'README.md')
}, {
  name: 'sort.js',
  path: Path.resolve(path.jsFlock, 'sort.js')
}, {
  name: 'sort.es5.js',
  path: Path.resolve(path.jsFlock, 'es5/sort.js')
}, {
  name: 'sort.es5.min.js',
  path: Path.resolve(path.jsFlock, 'es5/sort.min.js')
}];

const execute = function(command) {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout) => {
      if (err) {
        return reject(err);
      }
      console.info(`${stdout}`);
      return resolve();
    });
  });
};

console.info('Cleaning folders...');

execute('rm -rf node_modules/js-flock && rm -rf dist')
  .then(() => {
    console.info('Installing js-flock');
    return execute('npm install --no-package-lock js-flock');
  })
  .then(() => {
    console.info('Coping files...');
    Fs.ensureDirSync(path.dist);

    filesToInclude.forEach((file) => {
      Fs.copySync(file.path, Path.resolve(path.dist, file.name));
    });

    const packagePath = Path.resolve(path.dist, 'package.json');
    const packageJson = Fs.readJsonSync(packagePath);
    delete packageJson.private; // Used to prevent accidental publish with npm publish
    delete packageJson['//'];

    packageJson.main = 'sort.js';

    Fs.writeJsonSync(packagePath, packageJson);

    console.info(`Publishing version ${packageJson.version}...`);

    process.chdir(Path.resolve(path.dist));
    return execute('npm publish');
  })
  .then(() => {
    process.chdir(__dirname);
    execute('npm test');
  })
  .then(() => console.info('---ALL DONE---'));
