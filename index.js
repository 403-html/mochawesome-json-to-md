#!/usr/bin/env node
const fs = require("fs");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const _ = require("lodash");

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
  .option("showEmoji", {
    description:
      "defines whether there should be emoji in the final markdown file",
    type: "boolean",
    default: true,
  })
  .option("reportTitle", {
    description: "define report title in the final md file",
    type: "string",
    default: "Test report",
  })
  .option("showDate", {
    description:
      "defines whether there should be visible test date in the final markdown file",
    type: "boolean",
    default: true,
  })
  .option("showDuration", {
    description:
      "defines whether there should be visible duration of the test in the final markdown file",
    type: "boolean",
    default: true,
  })
  .option("showStats", {
    description:
      "defines whether there should be visible high level stats of the test in the final markdown file",
    type: "boolean",
    default: true,
  })
  .option("showPassed", {
    description:
      "defines whether there should be visible section with passed tests in the final markdown file",
    type: "boolean",
    default: false,
  })
  .option("showFailed", {
    description:
      "defines whether there should be visible section with failed tests in the final markdown file",
    type: "boolean",
    default: true,
  })
  .option("showSkipped", {
    description:
      "defines whether there should be visible section with skipped by user tests in the final markdown file",
    type: "boolean",
    default: true,
  })
  .option("showCypress", {
    description:
      "defines whether there should be visible section with skipped by Cypress tests in the final markdown file",
    type: "boolean",
    default: true,
  })
  .scriptName("mochawesome-json-to-md")
  .usage("$0 -p file/path.json -o file/path.md [args]")
  .epilogue(
    "for more information, visit https://github.com/htd-tstepien/mochawesome-json-to-md"
  )
  .help().argv;

// Create md string based on all informations
const mdTemplate = ({
  reportTitle,
  startDate,
  showDate,
  duration,
  showDuration,
  showStats,
  totalTests,
  otherTests,
  passedTests = [],
  showPassed,
  failedTests = [],
  showFailed,
  skippedTests = [],
  showSkipped,
  skippedCypress = [],
  showCypress,
  showEmoji,
}) => {
  const genDate = showDate
    ? `> Run start date: ${new Date(startDate).toLocaleString()} \n`
    : "";
  const genDuration = showDuration
    ? `> Duration: ${Math.round(duration / 60)}s \n`
    : "";

  const genStats = showStats
    ? `## Tests run stats
  - ${showEmoji ? "📚 " : ""}total tests: ${totalTests}
  - ${showEmoji ? "✔️ " : ""}passed: ${passedTests.length}
  - ${showEmoji ? "❌ " : ""}failed: ${failedTests.length}
  - ${showEmoji ? "🔜 " : ""}skipped: ${skippedTests.length}
  - ${showEmoji ? "⚠️ " : ""}skipped by Cypress: ${skippedCypress.length}
  - ${showEmoji ? "❇️ " : ""}other: ${otherTests} \n`
    : "";

  const genList = (emoji, list) => {
    let cacheList = [];
    _.forEach(list, ({ path, title }) =>
      cacheList.push(
        `- ${showEmoji ? `${emoji}` : ""} Path: ${path}, test: ${title}`
      )
    );
    return _.join(cacheList, "\n");
  };

  const genSection = ({ title, emoji, collection, check }) => {
    if (check) {
      return `## ${title}
  <details>
  <summary>Click to reveal</summary>
  <article>
  
${genList(emoji, collection)}
  </article>
  </details>\n`;
    } else {
      return "";
    }
  };

  return `# ${reportTitle}
${genDate}
${genDuration}
${genStats}
${genSection({
  title: "Passed tests",
  emoji: "✔️",
  collection: passedTests,
  check: showPassed,
})}
${genSection({
  title: "Failed tests",
  emoji: "💢",
  collection: failedTests,
  check: showFailed,
})}
${genSection({
  title: "Skipped tests",
  emoji: "🔜",
  collection: skippedTests,
  check: showSkipped,
})}
${genSection({
  title: "Skipped tests by Cypress",
  emoji: "⚠️",
  collection: skippedCypress,
  check: showCypress,
})}
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
  const {
    path,
    output,
    showEmoji,
    reportTitle,
    showDate,
    showDuration,
    showStats,
    showPassed,
    showFailed,
    showSkipped,
    showCypress,
  } = argv;

  const outputObj = getJsonFileObj(path);
  const convertedReport = extractAllInfo(outputObj);
  const generatedMd = mdTemplate({
    ...convertedReport,
    showEmoji,
    reportTitle,
    showDate,
    showDuration,
    showStats,
    showPassed,
    showFailed,
    showSkipped,
    showCypress,
  });

  fs.writeFile(output, generatedMd, (err) => {
    if (err) {
      throw new Error(err);
    }
  });
};

mocha_convert();
