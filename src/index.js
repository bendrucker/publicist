'use strict'

import assertClean from 'git-assert-clean'
import {cwd} from 'process'
import {resolve} from 'path'
import git from 'git-child'
import random from 'hat'
import * as build from './build'
import * as packages from './packages'
import * as logger from './log'

export {logger}

let pack, branch, tag

export function release (version) {
  return assertClean()
    .then(() => {
      return git.fetch()
    })
    .then(() => {
      return git.checkout('master')
    })
    .then(() => {
      return git.revList({
        _: 'HEAD..origin/master',
        count: true
      })
      .call('trim')
      .then(parseInt)
    })
    .then((count) => {
      if (count) throw new Error('Remote is ahead of master')
    })
    .then(() => {
      return packages.load()
    })
    .then((_pack_) => {
      pack = _pack_
      return packages.update(pack, version)
    })
    .then(() => {
      branch = `release-${pack.get('version')}`
      return git.checkout({
        b: branch
      })
    })
    .then(() => {
      return build.create(pack, pack.get('publicist.builds'))
    })
    .then(() => {
      return build.commit(pack)
    })
    .tap(() => {
      return git.checkout('master')
    })
    .tap(() => {
      return git.branch({
        D: branch
      })
    })
    .tap(() => {
      logger.log(`Released ${pack.get('name')}@${pack.get('version')}`)
      return tag
    })
}
