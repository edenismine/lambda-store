# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.2.0](https://github.com/tormenteddan/lambda-store/compare/v0.1.0...v0.2.0) (2020-10-05)


### ⚠ BREAKING CHANGES

* Added an extra type parameter to Tx in order to keep track and widen the error type
inside TaggedError on the left side of the TaskEither result. Changed sanitization function to be
more generic.

### Features

* add query, limit, orderby ops, fix Tx types ([3fcf73c](https://github.com/tormenteddan/lambda-store/commit/3fcf73c7e2a479c44a14556031522e1a7505b799))

## 0.1.0 (2020-10-03)


### ⚠ BREAKING CHANGES

* Changed module structure.

### Features

* add basic functionality ([1eb54ff](https://github.com/tormenteddan/lambda-store/commit/1eb54ff5b2150e1cbc799d34941d81f01708d9f3))
* **taggederror:** add TaggedError ([7674743](https://github.com/tormenteddan/lambda-store/commit/76747435b443b616a153a353f2752f32f543ad32))
