import type { ExtractedReport, MockedExtractedReport } from "../utils.d";
import type Mochawesome from "mochawesome";

import { parseJson } from "../data-manipulation";

const jsonObj: Mochawesome.Output = {
  stats: {
    suites: 1,
    tests: 1,
    passes: 1,
    pending: 0,
    failures: 0,
    start: new Date("2000-01-01T00:00:00.000Z"),
    end: new Date("2000-01-01T00:00:00.000Z"),
    duration: 0,
    testsRegistered: 0,
    passPercent: 0,
    pendingPercent: 0,
    other: 0,
    hasOther: false,
    skipped: 0,
    hasSkipped: false,
  },
  results: [
    {
      uuid: "uuid",
      title: "title",
      fullFile: "fullFile",
      file: "file",
      beforeHooks: [],
      afterHooks: [],
      suites: [],
      passes: [],
      failures: [],
      pending: [],
      skipped: [],
      tests: [],
      duration: 0,
      root: true,
      rootEmpty: true,
      _timeout: 0,
    },
  ],
  meta: {
    mocha: {
      version: "version",
    },
    mochawesome: {
      version: "version",
      options: {
        quiet: false,
        reportFilename: "report.html",
        saveHtml: false,
        saveJson: false,
        consoleReporter: "spec",
        useInlineDiffs: false,
        code: false,
      },
    },
    marge: {
      version: "version",
      options: {
        quiet: false,
        code: false,
        html: false,
        json: false,
        consoleReporter: "spec",
        reportFilename: "report.html",
        "no-code": false,
      },
    },
  },
};

describe("parseJson", () => {
  it("should return an object with the correct types", () => {
    const output: MockedExtractedReport = {
      ...jsonObj,
      tests: {
        passes: [],
        failures: [],
        pending: [],
        skipped: [],
      },
    };
    delete output.results;

    const report: ExtractedReport = parseJson(jsonObj);

    expect(report).toEqual(output);
  });
});
