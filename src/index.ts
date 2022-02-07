#!/usr/bin/env node
import "./arguments";
import { readFile, writeFile } from "./fsManipulate";
import { replaceTemplate } from "./templateManipulation";

const main = (): void => {
  // Get arguments
  const [, , reportPath, outputPath, templatePath] = process.argv;

  // Read the raport file
  const { stats, results } = JSON.parse(readFile(reportPath));

  // Read the template file
  const template = readFile(templatePath);

  // Replace the template with the report data
  const output = replaceTemplate(template, stats, results);

  // Generate the output
  writeFile(outputPath, output);
};

main();

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
