import {findTestsByTypeInDirectoryTree, extractTestsByType} from "../extractor";
import type {TestResultsTypes} from "../extractor.d";
import type Mochawesome from "mochawesome";

const baseDir: Mochawesome.PlainSuite = {
  suites: [],
  tests: [],
  passes: [],
  failures: [],
  pending: [],
  skipped: [],
  root: true,
  uuid: "213456789",
  title: "some title",
  file: "./some/path/to/file",
  fullFile: "/some/path/to/file",
  beforeHooks: [],
  afterHooks: [],
  duration: 0,
  rootEmpty: false,
  _timeout: 0,
};

const baseTest: Mochawesome.PlainTest = {
  uuid: "123456789",
  title: "some test",
  fullTitle: "some test",
  timedOut: false,
  duration: 0,
  state: "passed",
  speed: "fast",
  pass: true,
  fail: false,
  pending: false,
  code: "",
  parentUUID: "123456789",
  skipped: false,
  isHook: false,
  err: {},
};

describe("findTestsByTypeInDirectoryTree", () => {
  it("should return an empty array when no tests are found for given type", () => {
    const results = findTestsByTypeInDirectoryTree({
      type: "passes" as TestResultsTypes,
      dir: baseDir,
    });

    expect(results).toEqual([]);
  });

  it("should return an array of tests when tests are found in root", () => {
    const dir: Mochawesome.PlainSuite = {
      ...baseDir,
      passes: [baseTest.uuid],
      tests: [baseTest],
    };

    const results = findTestsByTypeInDirectoryTree({
      type: "passes" as TestResultsTypes,
      dir,
    });

    expect(results).toEqual([{path: dir.file, ...baseTest}]);
  });

  it("should return an array of tests when tests are found in nested suites", () => {
    const nestedDir: Mochawesome.PlainSuite = {
      ...baseDir,
      passes: [baseTest.uuid],
      tests: [baseTest],
    };

    const dir: Mochawesome.PlainSuite = {
      ...baseDir,
      suites: [nestedDir],
    };

    const results = findTestsByTypeInDirectoryTree({
      type: "passes" as TestResultsTypes,
      dir,
    });

    expect(results).toEqual([{path: nestedDir.file, ...baseTest}]);
  });

  it("should return an array of tests when tests are found in nested suites and root", () => {
    const nestedDir: Mochawesome.PlainSuite = {
      ...baseDir,
      passes: [baseTest.uuid],
      tests: [baseTest],
    };

    const dir: Mochawesome.PlainSuite = {
      ...baseDir,
      suites: [nestedDir],
      passes: [baseTest.uuid],
      tests: [baseTest],
    };

    const results = findTestsByTypeInDirectoryTree({
      type: "passes" as TestResultsTypes,
      dir,
    });

    expect(results).toEqual([
      {path: nestedDir.file, ...baseTest},
      {path: dir.file, ...baseTest},
    ]);
  });
});

describe("extractTestsByType", () => {
  it("should return an empty object when no tests are found", () => {
    const results = extractTestsByType([baseDir]);

    expect(results).toEqual({
      passes: [],
      failures: [],
      pending: [],
      skipped: [],
    });
  });

  it("should return an object with tests when tests are found in root", () => {
    const dir: Mochawesome.PlainSuite = {
      ...baseDir,
      passes: [baseTest.uuid],
      tests: [baseTest],
    };

    const results = extractTestsByType([dir]);

    expect(results).toEqual({
      passes: [{path: dir.file, ...baseTest}],
      failures: [],
      pending: [],
      skipped: [],
    });
  });

  it("should return an object with tests when tests are found in nested suites", () => {
    const nestedDir: Mochawesome.PlainSuite = {
      ...baseDir,
      passes: [baseTest.uuid],
      tests: [baseTest],
    };

    const dir: Mochawesome.PlainSuite = {
      ...baseDir,
      suites: [nestedDir],
    };

    const results = extractTestsByType([dir]);

    expect(results).toEqual({
      passes: [{path: nestedDir.file, ...baseTest}],
      failures: [],
      pending: [],
      skipped: [],
    });
  });

  it("should return an object with tests when tests are found in nested suites and root", () => {
    const nestedDir: Mochawesome.PlainSuite = {
      ...baseDir,
      passes: [baseTest.uuid],
      tests: [baseTest],
    };

    const dir: Mochawesome.PlainSuite = {
      ...baseDir,
      suites: [nestedDir],
      passes: [baseTest.uuid],
      tests: [baseTest],
    };

    const results = extractTestsByType([dir]);

    expect(results).toEqual({
      passes: [
        {path: nestedDir.file, ...baseTest},
        {path: dir.file, ...baseTest},
      ],
      failures: [],
      pending: [],
      skipped: [],
    });
  });

  it("should return an object with tests when tests are found in nested suites and root and different types", () => {
    const nestedDir: Mochawesome.PlainSuite = {
      ...baseDir,
      passes: [baseTest.uuid],
      tests: [baseTest],
    };

    const dir: Mochawesome.PlainSuite = {
      ...baseDir,
      suites: [nestedDir],
      passes: [baseTest.uuid],
      tests: [baseTest],
      failures: [baseTest.uuid],
    };

    const results = extractTestsByType([dir]);

    expect(results).toEqual({
      passes: [
        {path: nestedDir.file, ...baseTest},
        {path: dir.file, ...baseTest},
      ],
      failures: [{path: dir.file, ...baseTest}],
      pending: [],
      skipped: [],
    });
  });
});
