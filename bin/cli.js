'use strict'

import chalk from 'chalk'
import yargs from 'yargs'
import {sync as resolveSync} from 'resolve'
import {cwd} from 'process'
import pkg from '../package.json'

const publicist = require(resolveSync(pkg.name, {
  basedir: cwd()
}))

const [command] = yargs
  .usage('$0 command')
  .command('release', 'generate and tag builds')
  .demand(1, 'must provide a command')
  .argv
  ._

if (command === 'release') {
  yargs
    .demand(2, 'must provide a version')
    .usage('$0 release <version|increment>')
    .example('$0 release patch', 'release a new patch version')

  publicist.release(yargs.argv._[1]).catch(fail)
}

function fail (err) {
  publicist.logger.error(chalk.red('Release failed'))
  console.error(err.stack)
  process.exit(1)
}
