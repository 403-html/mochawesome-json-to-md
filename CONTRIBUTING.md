# Contributing

This docs are containing guidlines for contributing to the project.

## Issue Tracker

This project uses GitHub's issue tracker to track issues and ideas.

## Branching

Overall don't branch out of anything else than `main` branch. If you want to add many new features, you should create a new branch for each of it. **Don't make an aggregate branch**.

### Naming

- use `major/` prefix for major changes
- use `minor/` prefix for minor changes
- use `patch/` prefix for patch changes

For example:

> major/something-new

> minor/something-changed

> patch/something-improved

## Pull requests

### Naming

- use `feat:` prefix for feature requests
- use `bug:` prefix for bug fixes
- use `docs:` prefix for documentation only changes (example: this CONTRIBUTING.md or README.md)
- use `chore:` prefix for changes that don't affect the meaning of the code (build process, package manager, etc.)

### Merging

You can have as many commits as you wish but before giving for review please consider rebasing your branch to clear the commit list - so it'll leave cleaner repo after merging.

## Versioning

We are using semantic versioning. You can find more information about it [here](https://semver.org/).

- `major change` - adding functionality or refactoring to a package that **MAY** breaks all functionality unless appropriate changes are made to the project that uses that package
- `minor change` - adding functionality or refactoring the package, which changes some functionality but does not affect the basic functionality
- `patch change` - fixes a bug that does not affect the basic functionality

### Usage

You don't need to change manually version number. It will be automatically updated after PR review and before merging. It'll base on **PROPER branch** prefix.
