'use strict'

import assertClean from 'git-assert-clean'
import {cwd} from 'process'
import {resolve} from 'path'
import git from 'git-child'
import random from 'hat'
import build from './build'
import packages from './packages'
import logger from './log'

const config = require(resolve(cwd()), 'package.json').publicist
let branch

export function publish (version) {
  return assertClean()
    .then(() => {
      return git.fetch()
    })
    .then(() => {
      return git.checkout('master')
    })
    .then(() => {
      return packages.update(version)
    })
    .tap((pack) => {
      return git.add(pack.paths())
    })
    .tap((pack) => {
      version = pack.get('version')
      return git.commit({
        m: `Release v${version}`
      })
    })
    .tap(() => {
      branch = `release-${version}`
      return git.checkout({
        b: branch
      })
    })
    .tap((pack) => {
      return build.create(pack, config)
    })
    .tap(() => {
      return git.add('**/*')
    })
    .tap(() => {
      return git.commit(`v${version} Build`)
    })
    .tap(() => {
      return git.tag(`v${version}`)
    })
    .tap(() => {
      return git.checkout('master')
    })
    .tap(() => {
      return git.branch({
        D: branch
      })
    })
    .then((pack) => {
      return logger.log(`Released ${pack.get('name')}@${pack.get('version')}`)
    })
}
