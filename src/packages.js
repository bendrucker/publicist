'use strict'

import chalk from 'chalk'
import semver from 'semver'
import packhorse from 'packhorse'
import git from 'git-child'
import logger from './log'

export function load () {
  return packhorse.load([
    'package.json',
    {path: 'bower.json', optional: true}
  ])
}

export function update (pack, version) {
  version = bump(pack.get('version'), version)
  logger.log(`Bumping packages to ${chalk.magenta(version)}`)
  pack.set('version', version).write()
    .tap((pack) => {
      return git.add(pack.paths())
    })
    .tap(() => {
      return git.commit({
        m: `Release v${version}`
      })
    })
}

function bump (from, to) {
  if (semver.valid(to)) return to
  const bumped = semver.inc(from, to)
  if (!bumped) throw new Error('Invalid semver increment')
  return bumped
}
