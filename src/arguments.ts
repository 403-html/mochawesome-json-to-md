import yargs from "yargs";

const argv = yargs
  .usage("Usage: $0 -p ./report.json -o ./output.md [options]")
  .option("path", {
    alias: "p",
    describe: "Path to the report JSON file",
    type: "string",
    // demandOption: true,
    example: "./report.json",
  })
  .option("output", {
    alias: "o",
    describe: "Path to the output MD file",
    type: "string",
    // demandOption: true,
    example: "./output-report.md",
  })
  .option("template", {
    alias: "t",
    describe: "Path to the template MD file",
    type: "string",
    demandOption: false,
    default: "./templates/template.md",
  })
  .help("h").argv;
