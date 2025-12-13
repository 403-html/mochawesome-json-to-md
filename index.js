#!/usr/bin/env node
const fs = require("fs");
const { program } = require("commander");
const mustache = require("mustache");
const pathPkg = require("path");
const winston = require("winston");

program
  .option("-p, --path <path>", "Specify the path to the report")
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
  const level = verbose ? 'debug' : 'info';
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

/**
 * Reads the JSON file and returns its content as an object.
 * @param {string} filePath - Path to the JSON file.
 * @returns {object} - Parsed JSON object.
 * @throws Will throw an error if there's an issue parsing the JSON file.
 */
const readJsonFile = (filePath) => {
  logger.debug(`Reading JSON file: ${filePath}`);
  if (typeof filePath !== "string") {
    logger.error(`Invalid file path provided: ${filePath}`);
    throw new Error(`Invalid file path provided: ${filePath}`);
  }

  let jsonObj;
  try {
    logger.debug(`Parsing JSON file: ${filePath}`);
    jsonObj = JSON.parse(fs.readFileSync(filePath));
    logger.debug(`Successfully parsed JSON file: ${filePath}`);
  } catch (err) {
    logger.error(`Error while parsing JSON file: ${err}`);
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
  logger.debug('Extracting test results information');
  const { start: startDate, duration, tests: totalTests, other: otherTests } = stats;

  const testTypes = ["passes", "failures", "pending", "skipped"];

  const categorizedTests = testTypes.map((type) =>
    results.flatMap((result) =>
      collectTestsByType({
        type,
        suite: result,
        path: result.file,
      })
    )
  );

  logger.debug('Finished extracting test results information');
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
  logger.debug(`Collecting tests of type ${type}`);
  const localCache = cache;
  const { [type]: typeList, suites, tests } = suite;

  if (typeList.length > 0) {
    for (const uuid of typeList) {
      const foundTestByUuid = tests.find((test) => test.uuid === uuid);
      if (!foundTestByUuid) {
        logger.error(`Test with uuid ${uuid} not found`);
        throw new Error(`Test with uuid ${uuid} not found`);
      }
      logger.debug(`Found test with uuid ${uuid}`);
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
  logger.info('Starting Mocha to Markdown conversion');
  const { path, output, template, title } = program.opts();

  logger.info(`Reading test results from: ${path}`);
  const testResults = readJsonFile(path);

  logger.info('Extracting test results information');
  const extractedInfo = extractTestResultsInfo(testResults);

  logger.info(`Reading template file: ${template}`);
  const templateContent = fs.readFileSync(template, "utf-8");

  logger.info('Rendering template with test results');
  const renderedMarkdown = mustache.render(templateContent, {...extractedInfo, title});

  const outputPath = pathPkg.dirname(output);
  logger.info(`Creating directory structure: ${outputPath}`);
  fs.mkdirSync(outputPath, { recursive: true });

  logger.info(`Writing markdown to: ${output}`);
  fs.writeFileSync(output, renderedMarkdown);
};

convertMochaToMarkdown();
