#!/usr/bin/env node
const fs = require("fs");
const { program } = require("commander");
const mustache = require("mustache");
const pathPkg = require("path");
const winston = require("winston");

program
  .requiredOption("-p, --path <path>", "Specify the path to the report")
  .option("-o, --output <output>", "Specify the path for the markdown file", "./md-reports/output.md")
  .option("-t, --template <template>", "Specify the path to the template file", "./sample-template.md")
  .option("-T, --title <title>", "Specify the title for the report", "Test Report")
  .option("-v, --verbose", "Enable verbose mode for debug logging")
  .usage("$0 -p file/path.json [options]")
  .addHelpText(
    "after",
    "\nFor more information, visit https://github.com/403-html/mochawesome-json-to-md"
  )
  .parse(process.argv);

const createLogger = (verbose) => {
  const level = verbose ? "debug" : "info";
  return winston.createLogger({
    level,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level: logLevel, message }) => {
        return `${timestamp} | ${logLevel} | ${message}`;
      }),
    ),
    transports: [
      new winston.transports.Console({ level, handleExceptions: true }),
    ],
  });
};

const logger = createLogger(program.opts().verbose);

const ensureFileReadable = (filePath, label) => {
  if (typeof filePath !== "string" || filePath.trim() === "") {
    throw new Error(`${label} must be a non-empty string`);
  }

  let stats;
  try {
    stats = fs.statSync(filePath);
  } catch (error) {
    throw new Error(`${label} not accessible: ${filePath} (${error.message})`);
  }

  if (!stats.isFile()) {
    throw new Error(`${label} is not a file: ${filePath}`);
  }
};

const validateCliOptions = (options) => {
  ensureFileReadable(options.path, "Input report path");
  ensureFileReadable(options.template, "Template path");

  if (typeof options.output !== "string" || options.output.trim() === "") {
    throw new Error("Output path must be a non-empty string");
  }
};

/**
 * Reads the JSON file and returns its content as an object.
 * @param {string} filePath - Path to the JSON file.
 * @returns {object} - Parsed JSON object.
 * @throws Will throw an error if there's an issue parsing the JSON file.
 */
const readJsonFile = (filePath) => {
  logger.debug(`Reading JSON file: ${filePath}`);

  const fileContent = fs.readFileSync(filePath, "utf-8");
  try {
    const parsed = JSON.parse(fileContent);
    logger.debug(`Successfully parsed JSON file: ${filePath}`);
    return parsed;
  } catch (error) {
    throw new Error(`Error while parsing JSON file: ${filePath} (${error.message})`);
  }
};

const validateTestResultsSchema = (testResults) => {
  if (!testResults || typeof testResults !== "object") {
    throw new Error("Test results must be an object");
  }

  const { results, stats } = testResults;
  if (!Array.isArray(results)) {
    throw new Error('Test results must include a "results" array');
  }

  if (!stats || typeof stats !== "object") {
    throw new Error('Test results must include a "stats" object');
  }

  const requiredStats = ["start", "duration", "tests", "other"];
  for (const statKey of requiredStats) {
    if (stats[statKey] === undefined || stats[statKey] === null) {
      throw new Error(`Stats missing required field "${statKey}"`);
    }
  }

  return { results, stats };
};

/**
 * Extracts all necessary information from the parsed JSON object.
 * @param {object} param0 - Object containing the 'results' and 'stats' properties.
 * @param {Array} param0.results - List of results.
 * @param {object} param0.stats - Statistics object containing information about the test run (e.g. start date, duration, number of tests, etc.).
 * @returns {object} - Extracted information.
 */
const extractTestResultsInfo = ({ results, stats }) => {
  logger.debug("Extracting test results information");
  const { start: startDate, duration, tests: totalTests, other: otherTests } = stats;

  const testTypes = ["passes", "failures", "pending", "skipped"];
  const categorizedTests = testTypes.map((type) =>
    collectTestsByType({
      type,
      suiteList: results,
    })
  );

  const [passedTests, failedTests, skippedTests, skippedOtherTests] = categorizedTests;

  logger.debug("Finished extracting test results information");
  return {
    startDate,
    duration,
    passedTestsCount: passedTests.length,
    failedTestsCount: failedTests.length,
    skippedTestsCount: skippedTests.length,
    skippedOtherTestsCount: skippedOtherTests.length,
    otherTestsCount: otherTests,
    totalTests,
    passedExists: passedTests.length > 0,
    failedExists: failedTests.length > 0,
    skippedExists: skippedTests.length > 0,
    skippedOtherExists: skippedOtherTests.length > 0,
    passedTests,
    failedTests,
    skippedTests,
    skippedOtherTests,
  };
};

/**
 * Collects all tests of a given type without mutating the input suites.
 * @param {object} param0 - Object containing type and suiteList.
 * @param {string} param0.type - Type of the test.
 * @param {Array} param0.suiteList - Array of root suite objects.
 * @returns {Array} - List of tests with the given type.
 */
const collectTestsByType = ({ type, suiteList }) => {
  const collected = [];
  const stack = suiteList.map((suite) => ({ suite, path: suite.file || "" }));

  while (stack.length > 0) {
    const { suite, path } = stack.pop();
    const typeList = Array.isArray(suite[type]) ? suite[type] : [];
    const tests = Array.isArray(suite.tests) ? suite.tests : [];
    const childSuites = Array.isArray(suite.suites) ? suite.suites : [];

    for (const uuid of typeList) {
      const foundTestByUuid = tests.find((test) => test.uuid === uuid);
      if (!foundTestByUuid) {
        throw new Error(`Test with uuid ${uuid} not found for type ${type}`);
      }
      collected.push({ ...foundTestByUuid, path });
    }

    for (const subSuite of childSuites) {
      stack.push({ suite: subSuite, path: subSuite.file || path });
    }
  }

  return collected;
};

const convertMochaToMarkdown = () => {
  const { path, output, template, title } = program.opts();

  try {
    validateCliOptions({ path, output, template });

    logger.info("Starting Mocha to Markdown conversion");
    logger.info(`Reading test results from: ${path}`);
    const testResults = validateTestResultsSchema(readJsonFile(path));

    logger.info("Extracting test results information");
    const extractedInfo = extractTestResultsInfo(testResults);

    logger.info(`Reading template file: ${template}`);
    const templateContent = fs.readFileSync(template, "utf-8");

    logger.info("Rendering template with test results");
    const renderedMarkdown = mustache.render(templateContent, { ...extractedInfo, title });

    const outputPath = pathPkg.dirname(output);
    logger.info(`Ensuring output directory: ${outputPath}`);
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    logger.info(`Writing markdown to: ${output}`);
    fs.writeFileSync(output, renderedMarkdown);
  } catch (error) {
    logger.error(error.message);
    process.exitCode = 1;
  }
};

convertMochaToMarkdown();
