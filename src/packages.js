'use strict';

import chalk from 'chalk';
import semver from 'semver';
import packhorse from 'packhorse';
import git from 'git-child';
import log from './log';

export function update (version) {
  return git.fetch()
    .then(function () {
      return packhorse.load([
        'package.json',
        {path: 'bower.json', optional: true}
      ]);
    })
    .then(function (pack) {
      version = bump(pack.get('version'), version);
      log(`Bumping packages to ${chalk.magenta(version)}`);
      return pack.set('version', version).write();
    })
    .tap(function (pack) {
      return git.add(pack.paths());
    })
    .tap(function () {
      return git.commit({
        m: `Release v${version}`
      });
    });
}

function bump (from, to) {
  if (semver.valid(to)) return to; 
  const bumped = semver.inc(from, to);
  if (!bumped) throw new Error('Invalid semver increment');
  return bumped;
}
