'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _interopRequireDefault = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.create = create;
exports.commit = commit;

var _Promise = require('bluebird');

var _Promise2 = _interopRequireDefault(_Promise);

var _git = require('git-child');

var _git2 = _interopRequireDefault(_git);

var _r = require('resolve');

var _r2 = _interopRequireDefault(_r);

var _cwd = require('process');

'use strict';

var resolve = _Promise2['default'].promisify(_r2['default']);

function create(pack) {
  var config = arguments[1] === undefined ? [] : arguments[1];

  return _Promise2['default'].resolve(parse(config)) // eslint-disable-line no-undef
  .tap(function (config) {
    if (!config.length) throw new Error('publicist configuration must contain at least one build');
  }).map(buildDefaults).map(packagePath).map(function (build) {
    return [require(build.packagePath), build.config];
  }).map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var plugin = _ref2[0];
    var config = _ref2[1];

    return [pluginDefaults(plugin), plugin.defaults(pack, config)];
  }).each(function (_ref3) {
    var _ref32 = _slicedToArray(_ref3, 2);

    var plugin = _ref32[0];
    var config = _ref32[1];

    return plugin.before(pack, config);
  }).map(function (_ref4) {
    var _ref42 = _slicedToArray(_ref4, 2);

    var plugin = _ref42[0];
    var config = _ref42[1];

    return plugin.build(pack, config)['return']([plugin, config]);
  }).each(function (_ref5) {
    var _ref52 = _slicedToArray(_ref5, 2);

    var plugin = _ref52[0];
    var config = _ref52[1];

    return plugin.after(pack, config);
  }).then(function () {
    return pack.write();
  });
}

function commit(pack) {
  var version = pack.get('version');
  return _git2['default'].add({
    all: true
  }).then(function () {
    return _git2['default'].commit({
      m: 'v' + version + ' Build'
    });
  }).then(function () {
    var tag = 'v' + version;
    return _git2['default'].tag(tag)['return'](tag);
  });
}

function parse(config) {
  if (Array.isArray(config)) {
    return config;
  }return Object.keys(config).map(function (name) {
    return {
      name: name,
      config: configDefaults(name, config[name])
    };
  });
}

function buildDefaults(build) {
  return _extends({
    'package': 'publicist-' + build.name
  }, build);
}

function packagePath(build) {
  return resolve(build['package'], {
    basedir: _cwd.cwd()
  }).then(function (_ref6) {
    var _ref62 = _slicedToArray(_ref6, 1);

    var path = _ref62[0];

    return _extends({ packagePath: path }, build);
  });
}

function configDefaults(name, config) {
  return _extends({
    dest: './release/' + name
  }, config);
}

function pluginDefaults(plugin) {
  return _extends({
    defaults: identity,
    before: promiseNoop,
    build: promiseNoop,
    after: promiseNoop
  }, plugin);
}

function promiseNoop() {
  return _Promise2['default'].resolve();
}

function identity(input) {
  return input;
}