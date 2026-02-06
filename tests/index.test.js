import fs from 'fs';
import os from 'os';
import path from 'path';
import assert from 'node:assert/strict';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

import {
  collectTestsByType,
  convertMochaToMarkdown,
  extractTestResultsInfo,
  readJsonFile,
  runCli,
  validateCliOptions,
  validateTestResultsSchema,
} from '../index.js';
import { multiReport, nestedReport, singleOutcomeReport } from './fixtures/reports.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tempDirsToCleanup = [];

const trackDir = (dirPath) => {
  tempDirsToCleanup.push(dirPath);
  return dirPath;
};

const writeTempFile = (dir, name, contents) => {
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, contents);
  return filePath;
};

const createTempDir = () => trackDir(fs.mkdtempSync(path.join(os.tmpdir(), 'mocha-md-')));

const setupLinkedBin = () => {
  const installDir = createTempDir();
  const binDir = path.join(installDir, 'node_modules', '.bin');
  fs.mkdirSync(binDir, { recursive: true });
  const binPath = path.join(binDir, 'mochawesome-json-to-md');
  fs.symlinkSync(path.join(__dirname, '..', 'index.js'), binPath);
  return { binPath, installDir };
};

afterEach(() => {
  while (tempDirsToCleanup.length) {
    const dir = tempDirsToCleanup.pop();
    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch (error) {
      // best-effort cleanup
    }
  }
});

describe('readJsonFile', () => {
  it('reads and parses JSON content', () => {
    const dir = createTempDir();
    const fixturePath = writeTempFile(dir, 'report.json', JSON.stringify(singleOutcomeReport));

    const parsed = readJsonFile(fixturePath);

    assert.deepStrictEqual(parsed, singleOutcomeReport);
  });
});

describe('validateTestResultsSchema', () => {
  it('passes through valid results and stats objects', () => {
    const validated = validateTestResultsSchema(singleOutcomeReport);
    assert.strictEqual(validated.results, singleOutcomeReport.results);
    assert.strictEqual(validated.stats, singleOutcomeReport.stats);
  });

  it('throws when input is not an object', () => {
    assert.throws(() => validateTestResultsSchema(null), /must be an object/);
  });

  it('throws when results is missing', () => {
    assert.throws(
      () => validateTestResultsSchema({ stats: singleOutcomeReport.stats }),
      /"results" array/
    );
  });

  it('throws when stats is missing or incomplete', () => {
    assert.throws(
      () => validateTestResultsSchema({ results: [], stats: null }),
      /"stats" object/
    );
    assert.throws(
      () =>
        validateTestResultsSchema({ results: [], stats: { start: 'x', duration: 1, tests: 1 } }),
      /Stats missing required field "other"/
    );
  });
});

describe('collectTestsByType', () => {
  it('returns all tests of the requested type with paths', () => {
    const passes = collectTestsByType({ type: 'passes', suiteList: singleOutcomeReport.results });
    assert.strictEqual(passes.length, 1);
    assert.strictEqual(passes[0].uuid, 'p-1');
    assert.strictEqual(passes[0].path, '/tests/suite-a.js');
  });

  it('handles nested suites', () => {
    const pending = collectTestsByType({ type: 'pending', suiteList: nestedReport.results });
    const skipped = collectTestsByType({ type: 'skipped', suiteList: nestedReport.results });
    assert.deepStrictEqual(
      pending.map((t) => t.uuid),
      ['deep-pending']
    );
    assert.deepStrictEqual(
      skipped.map((t) => t.uuid),
      ['deep-skipped']
    );
  });

  it('throws when a uuid is referenced but not found', () => {
    assert.throws(
      () =>
        collectTestsByType({
          type: 'passes',
          suiteList: [
            {
              file: 'file.js',
              passes: ['missing-uuid'],
              failures: [],
              pending: [],
              skipped: [],
              suites: [],
              tests: [],
            },
          ],
        }),
      /missing-uuid/
    );
  });
});

describe('extractTestResultsInfo', () => {
  it('summarizes a single report across all outcome types', () => {
    const summary = extractTestResultsInfo(singleOutcomeReport);
    assert.strictEqual(summary.passedTestsCount, 1);
    assert.strictEqual(summary.failedTestsCount, 1);
    assert.strictEqual(summary.skippedTestsCount, 1);
    assert.strictEqual(summary.skippedOtherTestsCount, 1);
    assert.strictEqual(summary.passedExists, true);
    assert.strictEqual(summary.failedExists, true);
    assert.strictEqual(summary.skippedExists, true);
    assert.strictEqual(summary.skippedOtherExists, true);
  });

  it('aggregates multiple report entries', () => {
    const summary = extractTestResultsInfo(multiReport);
    assert.strictEqual(summary.passedTestsCount, 2);
    assert.strictEqual(summary.failedTestsCount, 1);
    assert.strictEqual(summary.skippedTestsCount, 1);
    assert.strictEqual(summary.skippedOtherTestsCount, 1);
    assert.strictEqual(summary.totalTests, 6);
    assert.deepStrictEqual(
      summary.passedTests.map((t) => t.uuid),
      ['p-2', 'p-3']
    );
  });

  it('captures nested suite tests', () => {
    const summary = extractTestResultsInfo(nestedReport);
    assert.deepStrictEqual(
      summary.skippedTests.map((t) => t.uuid),
      ['deep-pending']
    );
    assert.deepStrictEqual(
      summary.skippedOtherTests.map((t) => t.uuid),
      ['deep-skipped']
    );
    assert.deepStrictEqual(
      summary.failedTests.map((t) => t.uuid),
      ['child-fail']
    );
  });
});

describe('validateCliOptions', () => {
  it('accepts existing report and template paths', () => {
    const dir = createTempDir();
    const reportPath = writeTempFile(dir, 'report.json', '{}');
    const templatePath = writeTempFile(dir, 'template.md', '# template');
    assert.doesNotThrow(() =>
      validateCliOptions({
        path: reportPath,
        output: path.join(dir, 'out.md'),
        template: templatePath,
      })
    );
  });

  it('rejects empty paths, missing files, and non-file inputs', () => {
    const dir = createTempDir();
    const templatePath = writeTempFile(dir, 'template.md', '# template');
    const dirPath = fs.mkdtempSync(path.join(dir, 'dir-'));

    assert.throws(
      () => validateCliOptions({ path: '', output: 'out.md', template: templatePath }),
      /non-empty string/
    );

    assert.throws(
      () =>
        validateCliOptions({
          path: path.join(dir, 'missing.json'),
          output: 'out.md',
          template: templatePath,
        }),
      /not accessible/
    );

    assert.throws(
      () => validateCliOptions({ path: dirPath, output: 'out.md', template: templatePath }),
      /is not a file/
    );

    assert.throws(
      () => validateCliOptions({ path: templatePath, output: ' ', template: templatePath }),
      /Output path must be a non-empty string/
    );
  });
});

describe('convertMochaToMarkdown', () => {
  it('renders markdown output from a report and template', () => {
    const dir = createTempDir();
    const reportPath = writeTempFile(dir, 'report.json', JSON.stringify(singleOutcomeReport));
    const templatePath = writeTempFile(
      dir,
      'template.md',
      '# {{title}}\nPassed: {{passedTestsCount}}\nFailed: {{failedTestsCount}}\nOther skipped: {{skippedOtherTestsCount}}\n'
    );
    const outputPath = path.join(dir, 'out', 'report.md');

    convertMochaToMarkdown({
      path: reportPath,
      template: templatePath,
      output: outputPath,
      title: 'Report Title',
      verbose: false,
    });

    const output = fs.readFileSync(outputPath, 'utf-8');
    assert.ok(output.includes('Report Title'));
    assert.ok(output.includes('Passed: 1'));
    assert.ok(output.includes('Failed: 1'));
    assert.ok(output.includes('Other skipped: 1'));
  });

  it('uses the provided logger instance', () => {
    const dir = createTempDir();
    const reportPath = writeTempFile(dir, 'report.json', JSON.stringify(singleOutcomeReport));
    const templatePath = writeTempFile(dir, 'template.md', '# {{title}}');
    const outputPath = path.join(dir, 'out', 'report.md');
    const logs = [];
    const logger = {
      info: (message) => logs.push(message),
      error: (message) => logs.push(`error:${message}`),
      debug: (message) => logs.push(`debug:${message}`),
    };

    convertMochaToMarkdown({
      path: reportPath,
      template: templatePath,
      output: outputPath,
      title: 'Logged Title',
      verbose: true,
      logger,
    });

    assert.ok(logs.some((message) => message.includes('Starting Mocha to Markdown conversion')));
    assert.ok(logs.some((message) => message.includes('Reading JSON file')));
  });

  it('sets exit code on failure and does not throw', () => {
    const originalExitCode = process.exitCode;
    process.exitCode = 0;
    convertMochaToMarkdown({
      path: 'missing.json',
      template: 'missing.md',
      output: 'out.md',
      title: 'Title',
      verbose: false,
    });
    assert.strictEqual(process.exitCode, 1);
    process.exitCode = originalExitCode;
  });
});

describe('readJsonFile errors', () => {
  it('throws on invalid JSON content', () => {
    const dir = createTempDir();
    const badPath = writeTempFile(dir, 'bad.json', '{invalid}');
    assert.throws(() => readJsonFile(badPath), /Error while parsing JSON file/);
  });
});

describe('CLI invocation', () => {
  it('runs via node entrypoint and writes output', () => {
    const dir = createTempDir();
    const reportPath = writeTempFile(dir, 'report.json', JSON.stringify(singleOutcomeReport));
    const templatePath = writeTempFile(dir, 'template.md', '# {{title}}');
    const outputPath = path.join(dir, 'out', 'report.md');

    execFileSync(
      process.execPath,
      ['index.js', '-p', reportPath, '-t', templatePath, '-o', outputPath, '-T', 'CLI Title'],
      {
        cwd: path.join(__dirname, '..'),
        stdio: 'ignore',
      }
    );

    const rendered = fs.readFileSync(outputPath, 'utf-8');
    assert.ok(rendered.includes('CLI Title'));
  });

  it('runs through runCli helper with provided argv', () => {
    const dir = createTempDir();
    const reportPath = writeTempFile(dir, 'report.json', JSON.stringify(singleOutcomeReport));
    const templatePath = writeTempFile(dir, 'template.md', '# {{title}}');
    const outputPath = path.join(dir, 'out', 'report.md');

    runCli([
      'node',
      'index.js',
      '-p',
      reportPath,
      '-t',
      templatePath,
      '-o',
      outputPath,
      '-T',
      'RunCli Title',
    ]);

    const rendered = fs.readFileSync(outputPath, 'utf-8');
    assert.ok(rendered.includes('RunCli Title'));
  });

  it('runs via locally linked bin in an isolated temp install', () => {
    const { binPath, installDir } = setupLinkedBin();
    const reportPath = writeTempFile(installDir, 'report.json', JSON.stringify(singleOutcomeReport));
    const templatePath = writeTempFile(installDir, 'template.md', '# {{title}}');
    const outputPath = path.join(installDir, 'out', 'report.md');

    execFileSync(binPath, ['-p', reportPath, '-t', templatePath, '-o', outputPath, '-T', 'Isolated Title'], {
      cwd: installDir,
      stdio: 'ignore',
    });

    const rendered = fs.readFileSync(outputPath, 'utf-8');
    assert.ok(rendered.includes('Isolated Title'));
  });
});
