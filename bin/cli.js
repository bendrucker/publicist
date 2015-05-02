#!/usr/bin/env node

'use strict'

import chalk from 'chalk'
import yargs from 'yargs'
import {sync as resolveSync} from 'resolve'
import {cwd} from 'process'
import {interopRequireWildcard} from 'babel-runtime/helpers'
import pkg from './package.json'

const {publish, logger} = interopRequireWildcard(require(resolveSync(pkg.name, {
  basedir: cwd()
})))

const argv = yargs
  .usage('Increment packages and generate a tagged UMD build\nUsage: $0 <version|increment>')
  .example('$0 patch', 'release a new patch version')
  .argv

const [version] = argv._

publicist
  .publish(version)
  .catch(fail)

function fail (err) {
  publicist.logger.error(chalk.red('Release failed'))
  console.error(err.stack)
  process.exit(1)
}
