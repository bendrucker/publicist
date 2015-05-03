'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _interopRequireWildcard = function (obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } };

var _interopRequireDefault = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

exports.load = load;
exports.update = update;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

var _packhorse = require('packhorse');

var _packhorse2 = _interopRequireDefault(_packhorse);

var _git = require('git-child');

var _git2 = _interopRequireDefault(_git);

var _import = require('./log');

var logger = _interopRequireWildcard(_import);

'use strict';

function load() {
  return _packhorse2['default'].load(['package.json', { path: 'bower.json', optional: true }]);
}

function update(pack, version) {
  version = bump(pack.get('version'), version);
  logger.log('Bumping packages to ' + _chalk2['default'].magenta(version));
  return pack.set('version', version).write().tap(function (pack) {
    return _git2['default'].add(pack.paths());
  }).tap(function () {
    return _git2['default'].commit({
      m: 'Release v' + version
    });
  });
}

function bump(from, to) {
  if (_semver2['default'].valid(to)) {
    return to;
  }var bumped = _semver2['default'].inc(from, to);
  if (!bumped) throw new Error('Invalid semver increment');
  return bumped;
}