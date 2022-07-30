import minimist from "minimist";
import fs from "fs";
import path from "path";
const argv = minimist(process.argv.slice(2));

import { ControlledError, returnAllTests, readReport, t } from "./helpers";
import { helpScreen, versionScreen } from "./views";

if (argv.version || argv.v) versionScreen();

if (argv.help || argv.h) helpScreen();

if (!argv.path && !argv.p) {
  throw new ControlledError(t("error:pathnotdefined"));
} else if (!fs.existsSync(path.resolve(argv.path || argv.p))) {
  throw new ControlledError(
    `${t("error:reportdoesntexist1")} ${path.resolve(argv.path || argv.p)} ${t(
      "error:reportdoesntexist2"
    )}`
  );
}

const tests = returnAllTests(readReport(path.resolve(argv.path || argv.p)));