'use strict'

import curry from 'curry'
import chalk from 'chalk'

function log (logger, message) {
  logger.apply(console, [`[${chalk.cyan('publicist')}]`].concat(message))
}

export const log = curry(log)(console.log)
export const error = curry(log)(console.error)
