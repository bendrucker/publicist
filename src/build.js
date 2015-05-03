'use strict'

import Promise from 'bluebird'
import git from 'git-child'

export function create (pack, config = []) {
  return Promise.resolve(parse(config)) // eslint-disable-line no-undef
    .tap((config) => {
      if (!config.length) throw new Error('publicist configuration must contain at least one build')
    })
    .map(buildDefaults)
    .map((build) => {
      return [require(build.package), build.config]
    })
    .map(([plugin, config]) => {
      return [pluginDefaults(plugin), plugin.defaults(pack, config)]
    })
    .each(([plugin, config]) => {
      return plugin.before(pack, config)
    })
    .map(([plugin, config]) => {
      return plugin.build(pack, config).return([plugin, config])
    })
    .each(([plugin, config]) => {
      return plugin.after(pack, config)
    })
    .then(() => pack.write())
}

export function commit (pack) {
  const version = pack.get('version')
  return git.add('**/*')
    .then(() => {
      return git.commit({
        m: `v${version} Build`
      })
    })
    .then(() => {
      const tag = `v${version}`
      return git.tag(tag).return(tag)
    })
}

function parse (config) {
  if (Array.isArray(config)) return config
  return Object.keys(config)
    .map(function (name) {
      return {
        name,
        config: configDefaults(name, config[name])
      }
    })
}

function buildDefaults (build) {
  return Object.assign({
    package: `publicist-${build.name}`
  }, build)
}

function configDefaults (name, config) {
  return Object.assign({
    dest: `./release/${name}`
  }, config)
}

function pluginDefaults (plugin) {
  return Object.assign({}, plugin, {
    defaults: identity,
    before: promiseNoop,
    build: promiseNoop,
    after: promiseNoop
  })
}

function promiseNoop () {
  return Promise.resolve()
}

function identity (input) {
  return input
}
