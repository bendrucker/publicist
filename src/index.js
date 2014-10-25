#!/usr/bin/env node

'use strict';

var commander = require('commander');
var semver    = require('semver');
var Promise   = require('bluebird');
var path      = require('path');
var fs        = Promise.promisifyAll(require('fs'));

function fail (err) {
  console.error(err.stack);
  process.exit(1);
}

commander
  .command('release <version>')
  .description('Set a specific version or increment by a specified type')
  .action(function (version) {
    var cwd = process.cwd();
    return Promise.all([
      'package.json',
      'bower.json'
    ])
    .map(function (pkg) {
      var p = path.join(cwd, pkg);
      return Promise.props({
        path: p,
        data: fs.readFileAsync(p)
      });
    })
    .map(function (pkg) {
      pkg.data = JSON.parse(pkg.data);
      if (!semver.valid(version)) {
        version = semver.inc(pkg.data.version, version);
        if (!version) throw new Error('Invalid version or increment type');
      }
      pkg.data.version = version;
      pkg.data = JSON.stringify(pkg.data, void 0, 2);
      return fs.writeFileAsync(pkg.path, pkg.data + '\n');
    })
    .catch(fail);
  });

commander.parse(process.argv);
