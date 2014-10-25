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
      var p = path.join(cwd, pkg);
      this.paths[i] = p;
      return Promise.props({
        path: p,
        data: fs.readFileAsync(p)
      });
    })
    .each(function (pkg) {
      pkg.data = JSON.parse(pkg.data);
    })
    .tap(function (pkgs) {
      // store some attributes from the package for later user
      var pkg = pkgs[0].data;
      this.main = pkg.main;
      this.name = pkg.name;
      if (!semver.valid(version)) {
        version = semver.inc(pkg.version, version);
        if (!version) throw new Error('Invalid version or increment type');
      }
    })
    .each(function (pkg) {
      pkg.data.version = version;
      pkg.data = JSON.stringify(pkg.data, void 0, 2);
      return fs.writeFileAsync(pkg.path, pkg.data + '\n');
    })
    .then(function () {
      if (!fs.existsSync('./release')) {
        return fs.mkdirAsync('./release');
      }
    })
    .then(function () {
      return child.execFileAsync('npm', ['bin'])
        .spread(function (stdout) {
          return stdout.replace(/\n$/, '');
        });
    })
    .then(function (binDir) {
      var releasePath = './release/' + this.name + '.js';
      this.paths.push(releasePath);
      return child.execFileAsync(binDir + '/browserify', ['-s', this.name, '-e', this.main, '-o', releasePath]);
    })
    .then(function () {
      return git.apply(null, ['add'].concat(this.paths));
    })
    .then(function () {
      return git('commit', '-m', 'Release v' + version);
    })
    .then(function () {
      return git('tag', 'v' + version);
    })
    .catch(fail);
  });

commander.parse(process.argv);
