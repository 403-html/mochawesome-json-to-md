import minimist from "minimist";
import fs from "fs";
import path from "path";
const argv = minimist(process.argv.slice(2));

import helpText from "./help";
import { ControlledError } from "./helpers";

if (argv.version || argv.v) {
  console.info(`v${require("../package.json").version}`);
  process.exit(1);
}

if (argv.help || argv.h) {
  console.info(helpText);
  process.exit(1);
}

if (!argv.path && !argv.p) {
  throw new ControlledError(
    "Path to report wasn't defined. Please use --path or -p option to define path to the report."
  );
} else if (!fs.existsSync(path.resolve(argv.path || argv.p))) {
  throw new ControlledError(
    `Report doesn't exist under this path. Make sure that report under ${path.resolve(
      argv.path || argv.p
    )} exists.`
  );
}