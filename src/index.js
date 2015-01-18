#!/usr/bin/env node

'use strict';

var yargs      = require('yargs');
var semver     = require('semver');
var Promise    = require('bluebird');
var fs         = Promise.promisifyAll(require('fs'));
var packhorse  = require('packhorse');
var git        = require('git-child');
var hat        = require('hat');
var browserify = require('browserify');
var format     = require('util').format;

Promise.longStackTraces();

var argv = yargs
  .usage('Increment packages and generate a tagged UMD build\nUsage: $0 <version|increment>')
  .example('$0 patch', 'release a new patch version')
  .argv;

var version = argv._[0];

git.fetch()
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
  .tap(ensureReleaseDir)
  .then(function (pack) {
    var release = this.release = format('./release/%s.js', pack.get('name'));
    return new Promise(function (resolve, reject) {
      browserify({
        standalone: pack.get('name')
      })
      .add(pack.get('main'))
      .bundle()
      .pipe(fs.createWriteStream(release))
      .on('error', reject)
      .on('close', resolve);
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
    return git.tag(format('v%s', version));
  })
  .finally(function () {
    return git.checkout('master');
  })
  .finally(function () {
    return git.branch({
      D: this.branch
    });
  })
  .catch(fail);

function noop () {}

function fail (err) {
  console.error(err.stack);
  process.exit(1);
}

function ensureReleaseDir () {
  return fs.mkdirAsync('./release')
    .catch(function (err) {
      return err.code === 'EEXIST';
    }, noop);
}

function randomBranch () {
  return format('release-%s', hat());
}

function bump (from, to) {
  return semver.valid(to) ? to : semver.inc(from, to);
}
