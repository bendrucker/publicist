#!/usr/bin/env node

'use strict';

var commander  = require('commander');
var semver     = require('semver');
var Promise    = require('bluebird');
var fs         = Promise.promisifyAll(require('fs'));
var packhorse  = require('packhorse');
var git        = require('git-child');
var hat        = require('hat');
var browserify = require('browserify');
var format     = require('util').format;

Promise.longStackTraces();

commander
  .command('release <version>')
  .description('Set a specific version or increment by a specified type')
  .action(function (version) {
    return git.fetch()
      .bind({})
      .then(function () {
        return git.checkout('master');
      })
      .then(function () {
        return packhorse.load([
          'package.json',
          {path: 'bower.json', optional: true}
        ]);
      })
      .then(function (pack) {
        version = bump(pack.get('version'), version);
        return pack.set('version', version).write();
      })
      .tap(function (pack) {
        return git.add(pack.paths());
      })
      .tap(function () {
        return git.commit({
          m: format('Release v%s', version)
        });
      })
      .tap(function () {
        this.branch = randomBranch();
        return git.checkout({
          b: this.branch
        });
      })
      .tap(function () {
        return git.merge('master');
      })
      .tap(ensureRelease)
      .then(function (pack) {
        var release = this.release = format('./release/%s.js', pack.get('name'));
        return new Promise(function (resolve, reject) {
          browserify({
            standalone: pack.get('name')
          })
          .add(pack.get('main'))
          .pipe(release)
          .on('error', reject)
          .on('end', resolve);
        });
      })
      .then(function () {
        return git.add(this.release);
      })
      .then(function () {
        return git.commit({
          m: format('v%s UMD bundle', version)
        });
      })
      .then(function () {
        return git.tag({
          v: format('v%s', version)
        });
      })
      .then(function () {
        return git.checkout('master');
      })
      .finally(function () {
        return git.branch({
          D: this.branch
        });
      })
      .catch(fail);
    });

function noop () {}

function fail (err) {
  console.error(err.stack);
  process.exit(1);
}

function ensureRelease () {
  return fs.mkdirAsync('./release')
    .catch(function (err) {
      return err.code === 'EEXIST';
    }, noop);
}

function randomBranch () {
  return format('release-%s', hat());
}

function bump (from, to) {
  var version;
  if (!semver.valid(to)) {
    version = semver.inc(from, to);
    // semver.inc returns null if version is not a valid increment
    if (!version) throw new Error('Invalid version or increment type');
  }
  return version;
}

commander.parse(process.argv);
