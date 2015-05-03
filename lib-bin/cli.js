#!/usr/bin/env node
"use strict";

var _interopRequireDefault = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

var _chalk = require("chalk");

var _chalk2 = _interopRequireDefault(_chalk);

var _yargs = require("yargs");

var _yargs2 = _interopRequireDefault(_yargs);

var _resolveSync = require("resolve");

var _cwd = require("process");

var _pkg = require("../package.json");

var _pkg2 = _interopRequireDefault(_pkg);

"use strict";

var publicist = require(_resolveSync.sync(_pkg2["default"].name, {
  basedir: _cwd.cwd()
}));

var _yargs$usage$command$demand$argv$_ = _slicedToArray(_yargs2["default"].usage("$0 command").command("release", "generate and tag builds").demand(1, "must provide a command").argv._, 1);

var command = _yargs$usage$command$demand$argv$_[0];

if (command === "release") {
  _yargs2["default"].demand(1, "must provide a version").usage("$0 release <version|increment>").example("$0 release patch", "release a new patch version");

  publicist.release(_yargs2["default"].argv._[1])["catch"](fail);
}

function fail(err) {
  publicist.logger.error(_chalk2["default"].red("Release failed"));
  console.error(err.stack);
  process.exit(1);
}