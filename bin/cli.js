#!/usr/bin/env node

'use strict'

import chalk from 'chalk'
import yargs from 'yargs'
import {sync as resolveSync} from 'resolve'
import {cwd} from 'process'
import {interopRequireWildcard} from 'babel-runtime/helpers'
import pkg from './package.json'

const publicist = interopRequireWildcard(require(resolveSync(pkg.name, {
  basedir: cwd()
})))

const argv = yargs
  .usage('Increment packages and generate a tagged UMD build\nUsage: $0 <version|increment>')
  .example('$0 patch', 'release a new patch version')
  .argv

const [command] = yargs
  .usage('$0 command || version')
  .command('release', 'generate and tag builds')
  .demand(1, 'must provide a command')
  .argv
  ._

if (command === 'release') {
  yargs
    .demand(2, 'must provide a version')
    .usage('$0 release <version|increment>')
    .example('$0 release patch', 'release a new patch version')

  return publicist.release(yargs.argv._[1]).catch(fail)
}

function fail (err) {
  publicist.logger.error(chalk.red('Release failed'))
  console.error(err.stack)
  process.exit(1)
}
