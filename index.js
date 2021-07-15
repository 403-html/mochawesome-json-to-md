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

/*
Rekurencja do wyszukiwania tego samego property
fun()
  map collection -> if found, save -> ifelse search for next place -> else return 
*/

const willIterate = (parent, cache, type) => {
  if()
};

const getIt = (collection, type = "success") => {
  // Types: ["passes", "failures", "pending", "skipped"]
  let { results } = collection;
  _.map(results, (testFile) => willIterate(testFile, [],  "passes"));
  return results;
};

console.log(getIt(getJsonFileObj("cypress-combined-report.json")));

const extractAllInfo = (jsonObj) => {
  const startDate = jsonObj.stats.start;
  const duration = jsonObj.stats.duration;
  const totalTests = jsonObj.stats.tests;
  const passedTests = jsonObj.stats.passes;
  const skippedCypress = jsonObj.stats.skipped;
  const skippedTests = jsonObj.stats.pending;
  const otherTests = jsonObj.stats.other;
  return {};
};

const mocha_convert = () => {
  const { path, output, noEmoji } = argv;
};

// mocha_convert();
// module.export = mocha_convert;
