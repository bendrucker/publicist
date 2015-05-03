'use strict'

import curry from 'curry'
import chalk from 'chalk'

function write (logger, message) {
  logger.apply(console, [`[${chalk.cyan('publicist')}]`].concat(message))
}

export const log = curry(write)(console.log)
export const error = curry(write)(console.error)
