'use strict';

import curry from 'curry';
import chalk from 'chalk';

function log (logger, message) {
  logger.apply(console, [`[${chalk.cyan('publicist')}]`].concat(message));
}

export const info = curry(log)(console.info);
export const error = curry(log)(console.error);
