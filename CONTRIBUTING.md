# Contributing to the Project

Thank you for considering contributing to this project! These guidelines provide information on how to submit issues and pull requests to the project.

## Issue Tracker

We use GitHub's issue tracker to track issues and ideas for the project. If you have a suggestion or have found a bug, please open an issue in the issue tracker.

## Versioning

> 🚨 **Do not change the version number manually**; we have workflows in place to automatically update the version number based on the type of the change (based on branch name, *see below*).

We use semantic versioning for this project. You can find more information about it [here](https://semver.org/spec/v2.0.0.html). To determine the version number of your changes, use the following guidelines:

- `major change`: adding functionality or refactoring that **MAY** break all functionality unless appropriate changes are made to the project that uses the package. It'll update version by `1.x.x`.
- `minor change`: adding functionality or refactoring that changes some functionality but does not affect the basic functionality. It'll update version by `x.1.0`.
- `patch change`: fixing a bug that does not affect the basic functionality. It'll update version by `x.x.1`.
- `dependabot change`: *special automatic update*; updating dependencies by GitHub's dependabot. It'll update version by `x.x.1`.

## Branching out

> Following those rules will be checked by **lefthooks** and if you don't follow them, you will not be able to push your changes to the repository.

We encourage you to create a new branch for each new feature or change that you are working on. Please do not create an aggregate branch with multiple changes. When naming your branch, use the following prefixes to indicate the type of change:

- `major/` for major changes that may break functionality unless appropriate changes are made to the project that uses the package
- `minor/` for minor changes that modify some functionality but do not affect the basic functionality
- `patch/` for bug fixes that do not affect the basic functionality

For example:

- `major/new-feature`
- `minor/updated-functionality`
- `patch/fixed-bug`

## Pull Requests and Commits

> Following those rules will be checked by **workflow** and if you don't follow them, you will not be able to push your changes to the repository.

When creating a pull request (PR) or committing code changes, please use the following prefixes to indicate the type of change:

- `feat:` for new features (`feat!:` for breaking changes)
- `bug:` for bug fixes
- `docs:` for documentation only changes (e.g. `CONTRIBUTING.md` or `README.md`)
- `chore:` for changes that do not affect the meaning of the code (e.g. build process or package manager updates)
- `misc:` for changes that do not fit into any of the above categories

Before merging a PR, please consider rebasing your branch to clear the commit list, which will leave a cleaner repository after merging.

## Overall

Thank you again for considering contributing to this project. We appreciate your time and effort in making this project better.
