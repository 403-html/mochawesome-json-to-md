#!/usr/bin/env node
var $3YWac$fs = require("fs");
var $3YWac$yargsyargs = require("yargs/yargs");
var $3YWac$yargshelpers = require("yargs/helpers");
var $3YWac$lodash = require("lodash");

function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}




const $46b59eda256dd2bf$var$argv = $parcel$interopDefault($3YWac$yargsyargs)($3YWac$yargshelpers.hideBin(process.argv)).option("path", {
    alias: "p",
    description: "define path to the report",
    type: "string"
}).option("output", {
    alias: "o",
    description: "define path for the md file",
    type: "string",
    default: "./md-reports/output.md"
}).option("showEmoji", {
    description: "defines whether there should be emoji in the final markdown file",
    type: "boolean",
    default: true
}).option("reportTitle", {
    description: "define report title in the final md file",
    type: "string",
    default: "Test report"
}).option("showDate", {
    description: "defines whether there should be visible test date in the final markdown file",
    type: "boolean",
    default: true
}).option("showDuration", {
    description: "defines whether there should be visible duration of the test in the final markdown file",
    type: "boolean",
    default: true
}).option("showStats", {
    description: "defines whether there should be visible high level stats of the test in the final markdown file",
    type: "boolean",
    default: true
}).option("showPassed", {
    description: "defines whether there should be visible section with passed tests in the final markdown file",
    type: "boolean",
    default: false
}).option("showFailed", {
    description: "defines whether there should be visible section with failed tests in the final markdown file",
    type: "boolean",
    default: true
}).option("showSkipped", {
    description: "defines whether there should be visible section with skipped by user tests in the final markdown file",
    type: "boolean",
    default: true
}).option("showCypress", {
    description: "defines whether there should be visible section with skipped by Cypress tests in the final markdown file",
    type: "boolean",
    default: true
}).scriptName("mochawesome-json-to-md").usage("$0 -p file/path.json -o file/path.md [args]").epilogue("for more information, visit https://github.com/htd-tstepien/mochawesome-json-to-md").help().argv;
// Create md string based on all informations
const $46b59eda256dd2bf$var$mdTemplate = ({ reportTitle: reportTitle , startDate: startDate , showDate: showDate , duration: duration , showDuration: showDuration , showStats: showStats , totalTests: totalTests , otherTests: otherTests , passedTests: passedTests = [] , showPassed: showPassed , failedTests: failedTests = [] , showFailed: showFailed , skippedTests: skippedTests = [] , showSkipped: showSkipped , skippedCypress: skippedCypress = [] , showCypress: showCypress , showEmoji: showEmoji ,  })=>{
    const genDate = showDate ? `> Run start date: ${new Date(startDate).toLocaleString()} \n` : "";
    const genDuration = showDuration ? `> Duration: ${Math.round(duration / 60)}s \n` : "";
    const genStats = showStats ? `## Tests run stats\n  - ${showEmoji ? "📚 " : ""}total tests: ${totalTests}\n  - ${showEmoji ? "✔️ " : ""}passed: ${passedTests.length}\n  - ${showEmoji ? "❌ " : ""}failed: ${failedTests.length}\n  - ${showEmoji ? "🔜 " : ""}skipped: ${skippedTests.length}\n  - ${showEmoji ? "⚠️ " : ""}skipped by Cypress: ${skippedCypress.length}\n  - ${showEmoji ? "❇️ " : ""}other: ${otherTests} \n` : "";
    const genList = (emoji, list)=>{
        let cacheList = [];
        $3YWac$lodash.forEach(list, ({ path: path , title: title  })=>cacheList.push(`- ${showEmoji ? `${emoji}` : ""} Path: ${path}, test: ${title}`)
        );
        return $3YWac$lodash.join(cacheList, "\n");
    };
    const genSection = ({ title: title , emoji: emoji , collection: collection , check: check  })=>{
        if (check) return `## ${title}\n  <details>\n  <summary>Click to reveal</summary>\n  <article>\n  \n${genList(emoji, collection)}\n  </article>\n  </details>\n`;
        else return "";
    };
    return `# ${reportTitle}\n${genDate}\n${genDuration}\n${genStats}\n${genSection({
        title: "Passed tests",
        emoji: "✔️",
        collection: passedTests,
        check: showPassed
    })}\n${genSection({
        title: "Failed tests",
        emoji: "💢",
        collection: failedTests,
        check: showFailed
    })}\n${genSection({
        title: "Skipped tests",
        emoji: "🔜",
        collection: skippedTests,
        check: showSkipped
    })}\n${genSection({
        title: "Skipped tests by Cypress",
        emoji: "⚠️",
        collection: skippedCypress,
        check: showCypress
    })}\n`;
};
// Read json file and save it as obj
const $46b59eda256dd2bf$var$getJsonFileObj = (path)=>{
    if (typeof path !== "string") throw new Error(`Provide string path for JSON file, actually you pass: ${typeof path}`);
    let jsonObj;
    try {
        jsonObj = JSON.parse($3YWac$fs.readFileSync(path));
    } catch (err) {
        throw new Error(`Error while parsing JSON file: ${err}`);
    }
    return jsonObj;
};
// Reccurency return of all tests with given type
const $46b59eda256dd2bf$var$grabAllTestsByType = ({ type: type , dir: dir , path: path = dir.file , cache: cache = []  })=>{
    let localCache = cache;
    if (dir[type].length > 0) for (const uuid of dir[type]){
        const foundTestByUuid = $3YWac$lodash.find(dir.tests, (test)=>test.uuid === uuid
        );
        localCache.push({
            path: path,
            ...foundTestByUuid
        });
    }
    if (dir.suites.length > 0) for (const suit of dir.suites)$46b59eda256dd2bf$var$grabAllTestsByType({
        type: type,
        dir: suit,
        path: path,
        cache: localCache
    });
    return localCache;
};
// Return list of all tests from collection by types
const $46b59eda256dd2bf$var$getIt = (results)=>{
    const types = [
        "passes",
        "failures",
        "pending",
        "skipped"
    ];
    let cache = [];
    $3YWac$lodash.forEach(types, (type)=>{
        let typeCache = [];
        $3YWac$lodash.forEach(results, (result)=>{
            typeCache.push(...$46b59eda256dd2bf$var$grabAllTestsByType({
                type: type,
                dir: result
            }));
        });
        cache.push(typeCache);
    });
    return cache;
};
// Get all needed info from parsed json object
const $46b59eda256dd2bf$var$extractAllInfo = ({ results: results , stats: stats  })=>{
    const startDate = stats.start;
    const duration = stats.duration;
    const totalTests = stats.tests;
    const otherTests = stats.other;
    const [passedTests, failedTests, skippedTests, skippedCypress] = $46b59eda256dd2bf$var$getIt(results);
    return {
        startDate: startDate,
        duration: duration,
        totalTests: totalTests,
        otherTests: otherTests,
        passedTests: passedTests,
        failedTests: failedTests,
        skippedTests: skippedTests,
        skippedCypress: skippedCypress
    };
};
// main function to call converting and processing md file
const $46b59eda256dd2bf$var$mocha_convert = ()=>{
    const { path: path , output: output , showEmoji: showEmoji , reportTitle: reportTitle , showDate: showDate , showDuration: showDuration , showStats: showStats , showPassed: showPassed , showFailed: showFailed , showSkipped: showSkipped , showCypress: showCypress ,  } = $46b59eda256dd2bf$var$argv;
    const outputObj = $46b59eda256dd2bf$var$getJsonFileObj(path);
    const convertedReport = $46b59eda256dd2bf$var$extractAllInfo(outputObj);
    const generatedMd = $46b59eda256dd2bf$var$mdTemplate({
        ...convertedReport,
        showEmoji: showEmoji,
        reportTitle: reportTitle,
        showDate: showDate,
        showDuration: showDuration,
        showStats: showStats,
        showPassed: showPassed,
        showFailed: showFailed,
        showSkipped: showSkipped,
        showCypress: showCypress
    });
    $3YWac$fs.writeFile(output, generatedMd, (err)=>{
        if (err) throw new Error(err);
    });
};
$46b59eda256dd2bf$var$mocha_convert();


//# sourceMappingURL=index.js.map
