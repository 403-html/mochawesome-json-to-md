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
  failedTests,
  skippedTests,
  skippedCypress,
  otherTests,
  emojis = true,
}) => {
  return `# Test report \n
  > Run start date: ${startDate || 0} \n
  > Duration: ${duration / 60 || 0}s \n
\n
## Tests run stats \n
  ${emojis ? "📚 " : ""}total tests: ${totalTests || 0} \n
  ${emojis ? "✔️  " : ""}passed: ${passedTests || 0} \n
  ${emojis ? "❌ " : ""}failed: ${failedTests.length || 0} \n
  ${emojis ? "🔜 " : ""}skipped: ${skippedTests || 0} \n
  ${emojis ? "⚠️  " : ""}skipped by Cypress: ${skippedCypress || 0} \n
  ${emojis ? "❇️  " : ""}other: ${otherTests || 0} \n
\n
## Failed tests \n
  ${_.forEach(
    failedTests,
    (elem) => `${emojis ? "💢" : ""} ${elem.path}, tests: ${elem.tests} \n`
  )}`;
};

console.log(
  mdTemplate({
    startDate: "12.03.2021",
    duration: 231,
    totalTests: 12,
    passedTests: 7,
    failedTests: [
      { path: "./integration/test1.spec.js", tests: ["one", "two"] },
      { path: "./integration/test2.spec.js", tests: ["one", "two"] },
    ],
    skippedCypress: 2,
    emojis: false,
  })
);

const getJsonFileObj = (path) => {
  if (!path) {
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

const mocha_convert = () => {
  const { path, output, noEmoji } = argv;

  const { stats, results } = getJsonFileObj(path);

  console.log("suites " + stats.suites);
  console.log("tests " + stats.tests);
};

// mocha_convert();
// module.export = mocha_convert;

// Sample md template
/*
# Test Report
> Run start date: ${stats.start}
> Duration:  ${duration}

## Tests run stats
emoji total tests: 
emoji passed: 
emoji failed:
emoji skipped: 
emoji skipped by Cypress:
emoji other:

## Failed tests
emoji [path], [test]
emoji [path], [test]
emoji [path], [test]

*/
