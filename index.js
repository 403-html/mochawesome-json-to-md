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
 * --noEmoji, boolean, false, defines whether there should be no emojis in the final markdown file, example: "node index.js --noEmoji"
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
  .option("noEmoji", {
    description:
      "defines whether there should be no emojis in the final markdown file",
    type: "boolean",
    default: false,
  })
  .help().argv;

const mdTemplate = ({
  startDate,
  duration,
  totalTests,
  passedTests,
  failedTests = [],
  skippedTests = [],
  skippedCypress = [],
  otherTests = [],
  emojis = true,
}) => {
  // -- Sample --
  //   mdTemplate({
  //     startDate: "12.03.2021",
  //     duration: 231,
  //     totalTests: 12,
  //     passedTests: [],
  //     failedTests: [
  //       { path: "./integration/test1.spec.js", tests: ["one", "two"] },
  //       { path: "./integration/test2.spec.js", tests: ["one", "two"] },
  //     ],
  //     skippedCypress: [
  //       { path: "./integration/test1.spec.js", tests: ["one", "two"] },
  //     ],
  //     skippedTests: [],
  //     otherTests: [],
  //     emojis: true,
  //   })
  const genList = (emoji, list) =>
    _.map(
      list,
      ({ path, tests }) =>
        `${emojis ? `${emoji}` : ""} Path: ${path}, tests: ${tests}`
    );

  return `# Test report \n
  > Run start date: ${startDate} \n
  > Duration: ${duration / 60}s \n
\n
## Tests run stats \n
  ${emojis ? "📚 " : ""}total tests: ${totalTests || 0} \n
  ${emojis ? "✔️  " : ""}passed: ${passedTests || 0} \n
  ${emojis ? "❌ " : ""}failed: ${failedTests.length || 0} \n
  ${emojis ? "🔜 " : ""}skipped: ${skippedTests.length || 0} \n
  ${emojis ? "⚠️  " : ""}skipped by Cypress: ${skippedCypress.length || 0} \n
  ${emojis ? "❇️  " : ""}other: ${otherTests.length || 0} \n
\n
## Failed tests \n
<details>
<summary>Click to reveal</summary>
<article>
${_.join(genList("💢", failedTests), "\n")}
</article>
</details>
\n
## Skipped tests \n
<details>
<summary>Click to reveal</summary>
<article>
${_.join(genList("🔜", skippedTests), "\n")}
</article>
</details>
\n
## Skipped tests by Cypress
<details>
<summary>Click to reveal</summary>
<article>
${_.join(genList("⚠️", skippedCypress), "\n")}
</article>
</details>
\n
## Other tests
<details>
<summary>Click to reveal</summary>
<article>
${_.join(genList("❇️", otherTests), "\n")}
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
const grabAllTestsByType = ({ type, dir, cache = [] }) => {
  let localCache = cache;
  if (dir[type].length > 0) {
    _.forEach(dir[type], (uuid) => {
      localCache.push(_.filter(dir.tests, (test) => test.uuid === uuid).pop());
    });
  }
  if (dir.suites.length > 0) {
    _.forEach(dir.suites, (suit) =>
      grabAllTestsByType({ type: type, dir: suit, cache: localCache })
    );
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

console.log(extractAllInfo(getJsonFileObj("cypress-combined-report.json")));

// main function to call converting and processing md file
const mocha_convert = () => {
  const { path, output, noEmoji } = argv;
};

// mocha_convert();
// module.export = mocha_convert;
