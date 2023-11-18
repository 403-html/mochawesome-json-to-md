#!/usr/bin/env node
const fs = require("fs");
const { program } = require("commander");
const mustache = require("mustache");
const pathPkg = require("path");

/**
 * Reads the JSON file and returns its content as an object.
 * @param {string} filePath - Path to the JSON file.
 * @returns {object} - Parsed JSON object.
 * @throws Will throw an error if there's an issue parsing the JSON file.
 */
const readJsonFile = (filePath) => {
  if (typeof filePath !== "string") {
    throw new Error(
      `Provide string path for JSON file, actually you pass: ${typeof filePath}`
    );
  }

  let jsonObj;
  try {
    jsonObj = JSON.parse(fs.readFileSync(filePath));
  } catch (err) {
    throw new Error(`Error while parsing JSON file: ${err}`);
  }
  return jsonObj;
};

/**
 * Extracts all necessary information from the parsed JSON object.
 * @param {object} param0 - Object containing the 'results' and 'stats' properties.
 * @param {Array} param0.results - List of results.
 * @param {object} param0.stats - Statistics object containing information about the test run (e.g. start date, duration, number of tests, etc.).
 * @returns {object} - Extracted information.
 */
const extractTestResultsInfo = ({ results, stats }) => {
  const { start: startDate, duration, tests: totalTests, other: otherTests } =
    stats;

  const testTypes = ["passes", "failures", "pending", "skipped"];

  const categorizedTests = testTypes.map((type) => {
    return results.flatMap((result) =>
      collectTestsByType({
        type,
        suite: result,
        path: result.file,
      })
    );
  });

  return {
    startDate,
    duration,
    passedTestsCount: categorizedTests[0].length,
    failedTestsCount: categorizedTests[1].length,
    skippedTestsCount: categorizedTests[2].length,
    skippedCypressTestsCount: categorizedTests[3].length,
    otherTestsCount: otherTests,
    totalTests,
    passedExists: categorizedTests[0].length > 0,
    failedExists: categorizedTests[1].length > 0,
    skippedExists: categorizedTests[2].length > 0,
    skippedCypressExists: categorizedTests[3].length > 0,
    passedTests: categorizedTests[0],
    failedTests: categorizedTests[1],
    skippedTests: categorizedTests[2],
    skippedCypress: categorizedTests[3],
  };
};

/**
 * Recursively collects all tests with a given type.
 * @param {object} param0 - Object containing 'type', 'suite', 'path', and 'cache' properties.
 * @param {string} param0.type - Type of the test.
 * @param {object} param0.suite - Suite object.
 * @param {string} param0.path - Path to the test file.
 * @param {Array} param0.cache - Cache array.
 * @returns {Array} - List of tests with the given type.
 */
const collectTestsByType = ({ type, suite, path, cache = [] }) => {
  const localCache = cache;
  const { [type]: typeList, suites, tests } = suite;

  if (typeList.length > 0) {
    for (const uuid of typeList) {
      const foundTestByUuid = tests.find((test) => test.uuid === uuid);
      if (!foundTestByUuid) {
        throw new Error(`Test with uuid ${uuid} not found`);
      }
      foundTestByUuid.path = path;
      localCache.push({ path, ...foundTestByUuid });
    }
  }

  if (suites.length > 0) {
    for (const subSuite of suites) {
      collectTestsByType({
        type,
        suite: subSuite,
        path: subSuite.file || path,
        cache: localCache,
      });
    }
  }

  return localCache;
};

const convertMochaToMarkdown = () => {
  const { path, output, template, title } = program.opts();
  const testResults = readJsonFile(path);
  const extractedInfo = extractTestResultsInfo(testResults);

  // Read the template file
  const templateContent = fs.readFileSync(template, "utf-8");

  // Render the template with the extracted information
  const renderedMarkdown = mustache.render(templateContent, {...extractedInfo, title});

  // Ensure the directory structure exists for the output file
  const outputPath = pathPkg.dirname(output);
  fs.mkdirSync(outputPath, { recursive: true });

  // Write the generated markdown to the specified output file
  fs.writeFileSync(output, renderedMarkdown);
};

program
  .option("-p, --path <path>", "define path to the report")
  .option("-o, --output <output>", "define path for the md file", "./md-reports/output.md")
  .option("-t, --template <template>", "define path to the template file", "./sample-template.md")
  .option("-T, --title <title>", "define title for the report", "Test Report")
  .usage("$0 -p file/path.json [options]")
  .addHelpText(
    "after",
    "\nfor more information, visit https://github.com/403-html/mochawesome-json-to-md"
  )
  .parse(process.argv);

convertMochaToMarkdown();