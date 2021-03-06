# Contributing

These docs contain guidelines for contributing to the project.

## Issue Tracker

This project uses GitHub's issue tracker to track issues and ideas.

## Branching

Overall don't branch out of anything (else) than `main` branch. If you want to add many new features, you should create a new branch for each of it. **Don't make an aggregate branch**.

### Branch naming

- use `major/` prefix for major changes
- use `minor/` prefix for minor changes
- use `patch/` prefix for patch changes

For example:

> major/something-new

> minor/something-changed

> patch/something-improved

## Pull requests and commits

### PR and commits naming

Your PR description should be in the following format:

- use `feat:` prefix for feature requests
- use `bug:` prefix for bug fixes
- use `docs:` prefix for documentation only changes (example: this CONTRIBUTING.md or README.md)
- use `chore:` prefix for changes that don't affect the meaning of the code (build process, package manager, etc.)

Same for commits, but PRs affecting the changelog, so they'll be seen finally.

**Only** difference in commits naming is that commits which change something for release (like bumping version of the package) should be tagged with description "release", like `chore(release): bump version`.

### Creating a PR

Assign yourself to the PR.

If you're creating PR, but it's not ready for review - please create it as a draft.

If PR is ready for review remove it from draft status, please also add a label `ready-for-review` to it.

If it's possible _link_ your PR to proper issue which this PR is resolving.

### Merging

You can have as many commits as you wish but before giving for review please consider rebasing your branch to clear the commit list - so it'll leave cleaner repo after merging.

## Versioning

We are using semantic versioning. You can find more information about it [here](https://semver.org/).

- `major change` - adding functionality or refactoring to a package that **MAY** breaks all functionality unless appropriate changes are made to the project that uses that package
- `minor change` - adding functionality or refactoring the package, which changes some functionality but does not affect the basic functionality
- `patch change` - fixes a bug that does not affect the basic functionality

### Usage

Before you want to merge a PR, first merge the main branch to your branch. Then set the `semver` label to your PR. You don't have to change the version number manually. Change will be based on the **your PROPER branch** prefix.
