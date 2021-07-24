#!/usr/bin/env node
const fs = require("fs");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const _ = require("lodash");

/* Arguments we can pass
 * argument (alias), type, default, description, example
 *****************************************
 * --path (-p), string, undefined ,define path to the report, example: "node index.js --path="./reports/file.json""
 *
 * --output (-o), string, "./md-reports/output.md", define path for the md file, example: "node index.js --output="./output/file.md""
 *
 * --emoji, boolean, true, defines whether there should be no emoji in the final markdown file, example: "node index.js --emoji=false"
 */

const argv = yargs(hideBin(process.argv))
  .option("path", {
    alias: "p",
    description: "define path to the report",
    type: "string",
  })
  .option("output", {
    alias: "o",
    description: "define path for the md file",
    type: "string",
    default: "./md-reports/output.md",
  })
  .option("emoji", {
    description:
      "defines whether there should be emoji in the final markdown file",
    type: "boolean",
    default: true,
  })
  .help().argv;

const mdTemplate = ({
  startDate,
  duration,
  totalTests,
  otherTests,
  passedTests = [],
  failedTests = [],
  skippedTests = [],
  skippedCypress = [],
  emoji,
}) => {
  const genList = (emoji, list) =>
    _.map(
      list,
      ({ path, title }) =>
        `- ${emoji ? `${emoji}` : ""} Path: ${path}, test: ${title}`
    );

  return `# Test report
> Run start date: ${new Date(startDate).toLocaleString()}

> Duration: ${Math.round(duration / 60)}s

## Tests run stats
- ${emoji ? "📚 " : ""}total tests: ${totalTests}
- ${emoji ? "✔️ " : ""}passed: ${passedTests.length}
- ${emoji ? "❌ " : ""}failed: ${failedTests.length}
- ${emoji ? "🔜 " : ""}skipped: ${skippedTests.length}
- ${emoji ? "⚠️ " : ""}skipped by Cypress: ${skippedCypress.length}
- ${emoji ? "❇️ " : ""}other: ${otherTests}

## Failed tests
<details>
<summary>Click to reveal</summary>
<article>

${_.join(genList("💢", failedTests), "\n")}
</article>
</details>

## Skipped tests
<details>
<summary>Click to reveal</summary>
<article>

${_.join(genList("🔜", skippedTests), "\n")}
</article>
</details>

## Skipped tests by Cypress
<details>
<summary>Click to reveal</summary>
<article>

${_.join(genList("⚠️", skippedCypress), "\n")}
</article>
</details>
`;
};

// Read json file and save it as obj
const getJsonFileObj = (path) => {
  if (typeof path !== "string") {
    throw new Error(
      `Provide string path for JSON file, actually you pass: ${typeof path}`
    );
  }

  let jsonObj;
  try {
    jsonObj = JSON.parse(fs.readFileSync(path));
  } catch (err) {
    throw new Error(`Error while parsing JSON file: ${err}`);
  }
  return jsonObj;
};

// Reccurency return of all tests with given type
const grabAllTestsByType = ({ type, dir, path = dir.file, cache = [] }) => {
  let localCache = cache;
  if (dir[type].length > 0) {
    for (const uuid of dir[type]) {
      const foundTestByUuid = _.find(dir.tests, (test) => test.uuid === uuid);
      localCache.push({ path, ...foundTestByUuid });
    }
  }
  if (dir.suites.length > 0) {
    for (const suit of dir.suites) {
      grabAllTestsByType({
        type: type,
        dir: suit,
        path,
        cache: localCache,
      });
    }
  }
  return localCache;
};

// Return list of all tests from collection by types
const getIt = (results) => {
  const types = ["passes", "failures", "pending", "skipped"];
  let cache = [];

  _.forEach(types, (type) => {
    let typeCache = [];

    _.forEach(results, (result) => {
      typeCache.push(
        ...grabAllTestsByType({
          type: type,
          dir: result,
        })
      );
    });

    cache.push(typeCache);
  });

  return cache;
};

// Get all needed info from parsed json object
const extractAllInfo = ({ results, stats }) => {
  const startDate = stats.start;
  const duration = stats.duration;
  const totalTests = stats.tests;
  const otherTests = stats.other;
  const [passedTests, failedTests, skippedTests, skippedCypress] =
    getIt(results);

  return {
    startDate,
    duration,
    totalTests,
    otherTests,
    passedTests,
    failedTests,
    skippedTests,
    skippedCypress,
  };
};

// main function to call converting and processing md file
const mocha_convert = () => {
  const { path, output, emoji } = argv;

  const outputObj = getJsonFileObj(path);
  const convertedReport = extractAllInfo(outputObj);
  const generatedMd = mdTemplate({ ...convertedReport, emoji });

  fs.writeFile(output, generatedMd, (err) => {
    if (err) {
      throw new Error(err);
    }
  });
};

mocha_convert();
// module.export = mocha_convert;
