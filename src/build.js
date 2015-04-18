'use strict'

import Promise from 'bluebird'

export default function (pack, config = {}) {
  return Promise.resolve(
    /*eslint-disable no-undef*/
    // https://github.com/babel/babel-eslint/issues/70
    parse(config)
    /*eslint-enable no-undef*/
  )
  .map(buildDefaults)
  .map((build) => {
    return [require(build.package), build.config]
  })
  .map(([plugin, config]) => {
    return [pluginAPI(plugin), plugin.defaults(pack, config)]
  })
  .map(([plugin, config]) => {
    return plugin.before(pack, config).return([plugin, config])
  })
  .map(([plugin, config]) => {
    return plugin.build(pack, config).return([plugin, config])
  })
  .map(([plugin, config]) => {
    return plugin.after(pack, config)
  })
  .then(() => pack.write())
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

function pluginAPI (plugin) {
  return Object.assign({}, plugin, {
    before: noop,
    build: noop,
    after: noop
  })
}

function noop () {}
