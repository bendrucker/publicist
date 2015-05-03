'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _interopRequireDefault = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _curry = require('curry');

var _curry2 = _interopRequireDefault(_curry);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

'use strict';

function write(logger, message) {
  logger.apply(console, ['[' + _chalk2['default'].cyan('publicist') + ']'].concat(message));
}

var log = _curry2['default'](write)(console.log);
exports.log = log;
var error = _curry2['default'](write)(console.error);
exports.error = error;