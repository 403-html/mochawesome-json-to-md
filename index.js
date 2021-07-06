const fs = require("fs");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

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

const mocha_convert = () => {
  const { path, output, noEmoji } = argv;

  let jsonObj;
  try {
    jsonObj = JSON.parse(fs.readFileSync(path));
  } catch (err) {
    console.log(`Error while reading file ${err}`);
  }

  console.log(jsonObj.results[3].suites);
};

mocha_convert();
// module.export = mocha_convert;
