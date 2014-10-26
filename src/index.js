#!/usr/bin/env node

'use strict';

var commander = require('commander');
var semver    = require('semver');
var Promise   = require('bluebird');
var path      = require('path');
var fs        = Promise.promisifyAll(require('fs'));
var child     = Promise.promisifyAll(require('child_process'));

Promise.longStackTraces();

function fail (err) {
  console.error(err.stack);
  process.exit(1);
}

function git () {
  return child.execFileAsync('git', [].slice.apply(arguments));
}

commander
  .command('release <version>')
  .description('Set a specific version or increment by a specified type')
  .action(function (version) {
    var cwd = process.cwd();
    return Promise
    .bind({
      paths: []
    })
    .then(function () {
      return git('fetch');
    })
    .then(function () {
      return git('checkout', 'release');
    })
    .catch(function (err) {
      // match against errors that indicate that there is no local or remote branch 'release'
      return /pathspec 'release' did not match/.test(err.message);
    }, function () {
      return git('checkout', '-b', 'release');
    })
    .then(function () {
      return git('merge', 'master');
    })
    .return([
      'package.json',
      'bower.json'
    ])
    .map(function (pkg, i) {
      // generate absolute paths to the package files
      var p = path.join(cwd, pkg);
      // save those paths for a later git add
      this.paths[i] = p;
      // resolve the path and file contents
      return Promise.props({
        path: p,
        data: fs.readFileAsync(p)
      });
    })
    .each(function (pkg) {
      pkg.data = JSON.parse(pkg.data);
    })
    .tap(function (pkgs) {
      // store some attributes from the package.json for later use
      var pkg = pkgs[0].data;
      this.main = pkg.main;
      this.name = pkg.name;
      // if version is not a version string we assume it's an increment
      if (!semver.valid(version)) {
        version = semver.inc(pkg.version, version);
        // semver.inc returns null if version is not a valid increment
        if (!version) throw new Error('Invalid version or increment type');
      }
    })
    .each(function (pkg) {
      pkg.data.version = version;
      pkg.data = JSON.stringify(pkg.data, void 0, 2);
      // write back the data w/ 2 space indent and a trailing newline
      return fs.writeFileAsync(pkg.path, pkg.data + '\n');
    })
    .then(function () {
      // fs.exists does not use node callback conventions so we use existsSync
      if (!fs.existsSync('./release')) {
        return fs.mkdirAsync('./release');
      }
    })
    .then(function () {
      // get the npm bin directory
      return child.execFileAsync('npm', ['bin'])
        .spread(function (stdout) {
          return stdout.replace(/\n$/, '');
        });
    })
    .then(function (binDir) {
      var releasePath = './release/' + this.name + '.js';
      this.paths.push(releasePath);
      // call the local browserify bin file and generate a bundle
      return child.execFileAsync(binDir + '/browserify', ['-s', this.name, '-e', this.main, '-o', releasePath]);
    })
    .then(function () {
      // stage the release bundle
      return git.apply(null, ['add'].concat(this.paths));
    })
    .then(function () {
      // Commit the release bundle and packages
      return git('commit', '-m', 'Release v' + version);
    })
    .then(function () {
      return git('tag', 'v' + version);
    })
    .then(function () {
      return git('checkout', 'master');
    })
    .then(function () {
      return git('merge', 'release');
    })
    .catch(fail);
  });

commander.parse(process.argv);
