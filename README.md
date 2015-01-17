publicist
========================

Generate and tag a UMD build for release on a separate branch.

### Usage

```bash
$ release release <version | semver-increment>
```

You should add `releases/` to a `.npmignore` file or otherwise take steps to ensure that it is not needlessly published to npm. 

### Steps

* `git checkout master`
* Update `package.json` and `bower.json` to `version` or increment it by `semver-increment`
* `git commit` changes with the message `'Release v<version>'`
* `git checkout` a `release` branch
* `git merge` changes from `master`
* Bundle the `main` file with the local `browserify` command as a `standalone` and output it to a `releases` directory
* `git commit` the bundle with the message `v<version UMD Bundle`
* `git tag` the release commit
