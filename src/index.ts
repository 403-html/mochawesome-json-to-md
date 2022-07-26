import minimist from "minimist";
const argv = minimist(process.argv.slice(2));

import helpText from "./help";

if (argv.version || argv.v) {
  console.info(`v${require("../package.json").version}`);
  process.exit(0);
}

if (argv.help || argv.h || !argv._.length) {
  console.info(helpText);
  process.exit(0);
}
