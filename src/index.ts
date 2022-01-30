#!/usr/bin/env node
import fs from "fs";

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

const readTemplate = (path: string): string => {
  return fs.readFileSync(path, "utf8");
};

// TODO: process the report with the template

// -----------------------------------------------------------------------------
// Test dev data
// -----------------------------------------------------------------------------

const sampleTemplate = `# Test Report

## Test summary
Duration: {{ duration }}
Total tests: {{ totalTests }}

## Passed tests
{{ <passed> }}
Test "{{ testName }}" passed, it's in "{{ testFilePath }}" file.
{{ </passed> }}

## Failed tests
{{ <failed> }}
Test "{{ testName }}" failed, it's in "{{ testFilePath }}" file.
{{ </failed> }}
`;

// sample output:
// # Test Report
//
// ## Test summary
// Duration: 10
// Total tests: 10
//
// ## Passed tests
// Test "test 1" passed, it's in "./test/test-1.ts" file.
// Test "test 2" passed, it's in "./test/test-2.ts" file.
// Test "test 3" passed, it's in "./test/test-3.ts" file.
//
// ## Failed tests
// Test "test 4" failed, it's in "./test/test-4.ts" file.
// Test "test 5" failed, it's in "./test/test-5.ts" file.

const passed = [
  {
    testName: "test1",
    testFilePath: "./test1.js",
  },
  {
    testName: "test2",
    testFilePath: "./test2.js",
  },
];

const failed = [
  {
    testName: "test4",
    testFilePath: "./test4.js",
  },
  {
    testName: "test5",
    testFilePath: "./test5.js",
  },
];

const sampleData = {
  duration: 10,
  totalTests: 10,
  passed,
  failed,
};
