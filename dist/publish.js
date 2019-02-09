/* eslint-disable no-console */

const exec = require('child_process').exec;
const Fs = require('fs-extra'); // eslint-disable-line import/no-extraneous-dependencies
const Path = require('path');

const getPath = function(subPath) {
  return Path.resolve(__dirname, subPath);
};

const path = {
  dist: getPath('dist'),
  jsFlock: getPath('node_modules/js-flock/dist')
};

const filesToInclude = [{
  name: 'publish.js',
  path: getPath('publish.js')
}, {
  name: '.npmignore',
  path: getPath('.npmignore')
}, {
  name: 'package.json',
  path: getPath('package.json')
}, {
  name: 'LICENSE',
  path: getPath('LICENSE')
}, {
  name: 'README.md',
  path: getPath('README.md')
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
      console.log('called', err);
      if (err) {
        return reject(err);
      }
      console.info(`${stdout}`);
      return resolve();
    });
  });
};


async function publish() {
  console.info('Cleaning folders...');

  await execute('rm -rf node_modules/js-flock && rm -rf dist');

  console.info('Installing js-flock');

  await execute('npm install --no-package-lock js-flock');

  console.info('Coping files...');

  Fs.ensureDirSync(path.dist);

  filesToInclude.forEach((file) => {
    Fs.copySync(file.path, Path.resolve(path.dist, file.name));
  });

  // Modify package.json file
  const packagePath = Path.resolve(path.dist, 'package.json');
  const packageJson = Fs.readJsonSync(packagePath);
  delete packageJson.private; // Used to prevent accidental publish with npm publish
  delete packageJson['//'];
  delete packageJson.devDependencies;
  delete packageJson.dependencies;

  packageJson.main = 'sort.js';

  Fs.writeJsonSync(packagePath, packageJson);

  console.info(`Publishing version ${packageJson.version}...`);

  process.chdir(Path.resolve(path.dist));
  await execute('npm publish');

  console.info('Run tests');

  process.chdir(__dirname);
  execute('npm test');

  console.info('---ALL DONE---');
}

publish();
