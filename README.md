publicist
========================

[![Greenkeeper badge](https://badges.greenkeeper.io/bendrucker/publicist.svg)](https://greenkeeper.io/)

publicist generates and tags a UMD build for releases of code that may be used in a browser outside of CommonJS. It automates a workaround for dealing with Bower and other package managers that use Git repositories instead of storing code in a registry like NPM. If you commit your builds to master, you:

* pollute your commit history
* spend time fixing PRs where users commit changes to builds

Publicist avoids these issues by tagging commits on a temporary branch. Read more in [How It Works](#how-it-works)

## Installing

```bash
# globally
$ npm install -g publicist
# locally
$ npm install publicist
```

## Usage

```bash
$ publish <version | semver-increment>
```

You should add `release/` to a `.npmignore` file to ensure that it is not needlessly published to npm. 

## How it Works

1. `git checkout master`
2. Update `package.json` and `bower.json` to `version` or increment it by `semver-increment`
3. `git commit` changes with the message `'Release v<version>'`
4. `git checkout` a new `release-*` branch, where `*` is a random string
6. Bundle the `main` file using browserify as standalone (UMD) bundle and output it to a `./release` directory
7. `git commit` the bundle with the message `v<version> UMD Bundle`
8. `git tag` the release commit
9. `git checkout master` and force-delete the temporary release branch

The end result is a tag that points to a commit that no longer sits on a branch, but will remain in the tree.
