# Contributing to the Project

Thank you for considering contributing to this project! These guidelines provide information on how to submit issues and pull requests to the project.

## Issue Tracker

We use GitHub's issue tracker to track issues and ideas for the project. If you have a suggestion or have found a bug, please open an issue in the issue tracker.

## Branching

We encourage you to create a new branch for each new feature or change that you are working on. Please do not create an aggregate branch with multiple changes. When naming your branch, use the following prefixes to indicate the type of change:

- `major/` for major changes that may break functionality unless appropriate changes are made to the project that uses the package
- `minor/` for minor changes that modify some functionality but do not affect the basic functionality
- `patch/` for bug fixes that do not affect the basic functionality

For example:

- `major/new-feature`
- `minor/updated-functionality`
- `patch/fixed-bug`

## Pull Requests and Commits

When creating a pull request (PR) or committing code changes, please use the following prefixes to indicate the type of change:

- `feat:` for new features
- `bug:` for bug fixes
- `docs:` for documentation only changes (e.g. `CONTRIBUTING.md` or `README.md`)
- `chore:` for changes that do not affect the meaning of the code (e.g. build process or package manager updates)

Before merging a PR, please consider rebasing your branch to clear the commit list, which will leave a cleaner repository after merging.

## Versioning

We use semantic versioning for this project. You can find more information about it [here](https://semver.org/spec/v2.0.0.html). To determine the version number of your changes, use the following guidelines:

- `major change`: adding functionality or refactoring that **MAY** break all functionality unless appropriate changes are made to the project that uses the package
- `minor change`: adding functionality or refactoring that changes some functionality but does not affect the basic functionality
- `patch change`: fixing a bug that does not affect the basic functionality

To set the version number for your changes, use the `semver` label on your PR and base the version number on the prefix of your branch (e.g. `major/new-feature` would result in a major version bump). **Do not change the version number manually**.

## Overall

Thank you again for considering contributing to this project. We appreciate your time and effort in making this project better.
