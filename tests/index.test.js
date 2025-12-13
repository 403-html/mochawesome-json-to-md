const fs = require("fs");
const os = require("os");
const path = require("path");

const {
  collectTestsByType,
  convertMochaToMarkdown,
  extractTestResultsInfo,
  readJsonFile,
  validateCliOptions,
  validateTestResultsSchema,
} = require("../index");
const {
  multiReport,
  nestedReport,
  singleOutcomeReport,
} = require("./fixtures/reports");

const writeTempFile = (dir, name, contents) => {
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, contents);
  return filePath;
};

const createTempDir = () => fs.mkdtempSync(path.join(os.tmpdir(), "mocha-md-"));

describe("readJsonFile", () => {
  it("reads and parses JSON content", () => {
    const dir = createTempDir();
    const fixturePath = writeTempFile(dir, "report.json", JSON.stringify(singleOutcomeReport));

    const parsed = readJsonFile(fixturePath);

    expect(parsed).toEqual(singleOutcomeReport);
  });
});

describe("validateTestResultsSchema", () => {
  it("passes through valid results and stats objects", () => {
    const validated = validateTestResultsSchema(singleOutcomeReport);
    expect(validated.results).toBe(singleOutcomeReport.results);
    expect(validated.stats).toBe(singleOutcomeReport.stats);
  });
});

describe("collectTestsByType", () => {
  it("returns all tests of the requested type with paths", () => {
    const passes = collectTestsByType({ type: "passes", suiteList: singleOutcomeReport.results });
    expect(passes).toHaveLength(1);
    expect(passes[0]).toMatchObject({ uuid: "p-1", path: "/tests/suite-a.js" });
  });

  it("handles nested suites", () => {
    const pending = collectTestsByType({ type: "pending", suiteList: nestedReport.results });
    const skipped = collectTestsByType({ type: "skipped", suiteList: nestedReport.results });
    expect(pending.map((t) => t.uuid)).toEqual(["deep-pending"]);
    expect(skipped.map((t) => t.uuid)).toEqual(["deep-skipped"]);
  });
});

describe("extractTestResultsInfo", () => {
  it("summarizes a single report across all outcome types", () => {
    const summary = extractTestResultsInfo(singleOutcomeReport);
    expect(summary).toMatchObject({
      passedTestsCount: 1,
      failedTestsCount: 1,
      skippedTestsCount: 1,
      skippedOtherTestsCount: 1,
      passedExists: true,
      failedExists: true,
      skippedExists: true,
      skippedOtherExists: true,
    });
  });

  it("aggregates multiple report entries", () => {
    const summary = extractTestResultsInfo(multiReport);
    expect(summary).toMatchObject({
      passedTestsCount: 2,
      failedTestsCount: 1,
      skippedTestsCount: 1,
      skippedOtherTestsCount: 1,
      totalTests: 6,
    });
    expect(summary.passedTests.map((t) => t.uuid)).toEqual(["p-2", "p-3"]);
  });

  it("captures nested suite tests", () => {
    const summary = extractTestResultsInfo(nestedReport);
    expect(summary.skippedTests.map((t) => t.uuid)).toEqual(["deep-pending"]);
    expect(summary.skippedOtherTests.map((t) => t.uuid)).toEqual(["deep-skipped"]);
    expect(summary.failedTests.map((t) => t.uuid)).toEqual(["child-fail"]);
  });
});

describe("validateCliOptions", () => {
  it("accepts existing report and template paths", () => {
    const dir = createTempDir();
    const reportPath = writeTempFile(dir, "report.json", "{}");
    const templatePath = writeTempFile(dir, "template.md", "# template");
    expect(() =>
      validateCliOptions({
        path: reportPath,
        output: path.join(dir, "out.md"),
        template: templatePath,
      })
    ).not.toThrow();
  });
});

describe("convertMochaToMarkdown", () => {
  it("renders markdown output from a report and template", () => {
    const dir = createTempDir();
    const reportPath = writeTempFile(dir, "report.json", JSON.stringify(singleOutcomeReport));
    const templatePath = writeTempFile(
      dir,
      "template.md",
      "# {{title}}\nPassed: {{passedTestsCount}}\nFailed: {{failedTestsCount}}\nOther skipped: {{skippedOtherTestsCount}}\n"
    );
    const outputPath = path.join(dir, "out", "report.md");

    convertMochaToMarkdown({
      path: reportPath,
      template: templatePath,
      output: outputPath,
      title: "Report Title",
      verbose: false,
    });

    const output = fs.readFileSync(outputPath, "utf-8");
    expect(output).toContain("Report Title");
    expect(output).toContain("Passed: 1");
    expect(output).toContain("Failed: 1");
    expect(output).toContain("Other skipped: 1");
  });
});
