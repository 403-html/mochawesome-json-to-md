const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const {
  collectTestsByType,
  convertMochaToMarkdown,
  extractTestResultsInfo,
  readJsonFile,
  runCli,
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

  it("throws when input is not an object", () => {
    expect(() => validateTestResultsSchema(null)).toThrow("must be an object");
  });

  it("throws when results is missing", () => {
    expect(() =>
      validateTestResultsSchema({ stats: singleOutcomeReport.stats })
    ).toThrow('"results" array');
  });

  it("throws when stats is missing or incomplete", () => {
    expect(() =>
      validateTestResultsSchema({ results: [], stats: null })
    ).toThrow('"stats" object');
    expect(() =>
      validateTestResultsSchema({ results: [], stats: { start: "x", duration: 1, tests: 1 } })
    ).toThrow('Stats missing required field "other"');
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

  it("throws when a uuid is referenced but not found", () => {
    expect(() =>
      collectTestsByType({
        type: "passes",
        suiteList: [
          {
            file: "file.js",
            passes: ["missing-uuid"],
            failures: [],
            pending: [],
            skipped: [],
            suites: [],
            tests: [],
          },
        ],
      })
    ).toThrow("missing-uuid");
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

  it("rejects empty paths, missing files, and non-file inputs", () => {
    const dir = createTempDir();
    const templatePath = writeTempFile(dir, "template.md", "# template");
    const dirPath = fs.mkdtempSync(path.join(dir, "dir-"));

    expect(() =>
      validateCliOptions({ path: "", output: "out.md", template: templatePath })
    ).toThrow("non-empty string");

    expect(() =>
      validateCliOptions({ path: path.join(dir, "missing.json"), output: "out.md", template: templatePath })
    ).toThrow("not accessible");

    expect(() =>
      validateCliOptions({ path: dirPath, output: "out.md", template: templatePath })
    ).toThrow("is not a file");

    expect(() =>
      validateCliOptions({ path: templatePath, output: " ", template: templatePath })
    ).toThrow("Output path must be a non-empty string");
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

  it("sets exit code on failure and does not throw", () => {
    const originalExitCode = process.exitCode;
    process.exitCode = 0;
    convertMochaToMarkdown({
      path: "missing.json",
      template: "missing.md",
      output: "out.md",
      title: "Title",
      verbose: false,
    });
    expect(process.exitCode).toBe(1);
    process.exitCode = originalExitCode;
  });
});

describe("readJsonFile errors", () => {
  it("throws on invalid JSON content", () => {
    const dir = createTempDir();
    const badPath = writeTempFile(dir, "bad.json", "{invalid}");
    expect(() => readJsonFile(badPath)).toThrow("Error while parsing JSON file");
  });
});

describe("CLI invocation", () => {
  it("runs via node entrypoint and writes output", () => {
    const dir = createTempDir();
    const reportPath = writeTempFile(dir, "report.json", JSON.stringify(singleOutcomeReport));
    const templatePath = writeTempFile(dir, "template.md", "# {{title}}");
    const outputPath = path.join(dir, "out", "report.md");

    execFileSync(process.execPath, ["index.js", "-p", reportPath, "-t", templatePath, "-o", outputPath, "-T", "CLI Title"], {
      cwd: path.join(__dirname, ".."),
      stdio: "ignore",
    });

    const rendered = fs.readFileSync(outputPath, "utf-8");
    expect(rendered).toContain("CLI Title");
  });

  it("runs through runCli helper with provided argv", () => {
    const dir = createTempDir();
    const reportPath = writeTempFile(dir, "report.json", JSON.stringify(singleOutcomeReport));
    const templatePath = writeTempFile(dir, "template.md", "# {{title}}");
    const outputPath = path.join(dir, "out", "report.md");

    runCli(["node", "index.js", "-p", reportPath, "-t", templatePath, "-o", outputPath, "-T", "RunCli Title"]);

    const rendered = fs.readFileSync(outputPath, "utf-8");
    expect(rendered).toContain("RunCli Title");
  });
});
