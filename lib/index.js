'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _interopRequireWildcard = function (obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } };

var _interopRequireDefault = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

exports.release = release;

var _assertClean = require('git-assert-clean');

var _assertClean2 = _interopRequireDefault(_assertClean);

var _cwd = require('process');

var _resolve = require('path');

var _git = require('git-child');

var _git2 = _interopRequireDefault(_git);

var _random = require('hat');

var _random2 = _interopRequireDefault(_random);

var _import = require('./build');

var build = _interopRequireWildcard(_import);

var _import2 = require('./packages');

var packages = _interopRequireWildcard(_import2);

var _import3 = require('./log');

var logger = _interopRequireWildcard(_import3);

'use strict';

exports.logger = logger;

var pack = undefined,
    branch = undefined,
    tag = undefined;

function release(version) {
  return _assertClean2['default']().then(function () {
    return _git2['default'].fetch();
  }).then(function () {
    return _git2['default'].checkout('master');
  }).then(function () {
    return _git2['default'].revList({
      _: 'HEAD..origin/master',
      count: true
    }).call('trim').then(parseInt);
  }).then(function (count) {
    if (count) throw new Error('Remote is ahead of master');
  }).then(function () {
    return packages.load();
  }).then(function (_pack_) {
    pack = _pack_;
    return packages.update(pack, version);
  }).then(function () {
    branch = 'release-' + pack.get('version');
    return _git2['default'].checkout({
      b: branch
    });
  }).then(function () {
    return build.create(pack, pack.get('publicist.builds'));
  }).then(function () {
    return build.commit(pack);
  }).tap(function () {
    return _git2['default'].checkout('master');
  }).tap(function () {
    return _git2['default'].branch({
      D: branch
    });
  }).tap(function () {
    logger.log('Released ' + pack.get('name') + '@' + pack.get('version'));
    return tag;
  });
}