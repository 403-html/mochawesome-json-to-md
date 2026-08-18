import type { Command } from 'commander';
import type { Logger } from 'winston';

/** A single mocha/mochawesome test result, as found in a suite's `tests` array. */
export interface MochaTest {
  uuid: string;
  title: string;
  fullTitle: string;
  timedOut: boolean;
  duration: number;
  state: string | null;
  speed?: string;
  pass: boolean;
  fail: boolean;
  pending: boolean;
  context?: unknown;
  code?: string;
  err?: {
    message?: string;
    estack?: string;
    diff?: string;
    [key: string]: unknown;
  };
  parentUUID?: string;
  isHook?: boolean;
  skipped?: boolean;
  [key: string]: unknown;
}

/** A test as returned by {@link collectTestsByType}/{@link extractTestResultsInfo}, annotated with the suite file path it was collected from. */
export interface CollectedTest extends MochaTest {
  path: string;
}

/** A mochawesome suite node; suites nest recursively via `suites`. */
export interface MochaSuite {
  file?: string;
  passes?: string[];
  failures?: string[];
  pending?: string[];
  skipped?: string[];
  suites?: MochaSuite[];
  tests?: MochaTest[];
  [key: string]: unknown;
}

export interface MochaStats {
  start: string;
  duration: number;
  tests: number;
  other: number;
  [key: string]: unknown;
}

export interface MochaTestResults {
  results: MochaSuite[];
  stats: MochaStats;
  [key: string]: unknown;
}

export interface ExtractedTestResultsInfo {
  startDate: string;
  duration: number;
  durationSeconds: number;
  /** Percentage of passed tests out of total tests (e.g. `83.33`), or `0` when there are no tests. */
  passRate: number;
  passedTestsCount: number;
  failedTestsCount: number;
  skippedTestsCount: number;
  skippedOtherTestsCount: number;
  otherTestsCount: number;
  totalTests: number;
  passedExists: boolean;
  failedExists: boolean;
  skippedExists: boolean;
  skippedOtherExists: boolean;
  passedTests: CollectedTest[];
  failedTests: CollectedTest[];
  skippedTests: CollectedTest[];
  skippedOtherTests: CollectedTest[];
}

/** Minimal logger shape accepted anywhere a custom logger can be supplied; a winston `Logger` also satisfies this. */
export interface MinimalLogger {
  info?(message: string): void;
  error?(message: string): void;
  debug?(message: string): void;
  warn?(message: string): void;
}

export interface ConvertMochaToMarkdownOptions {
  /** Path to the mochawesome JSON report. */
  path: string;
  /** Path for the generated markdown file. */
  output: string;
  /** Path to the mustache template file. */
  template: string;
  /** Title for the report, substituted into the `{{title}}` tag. */
  title?: string;
  /** Enable verbose (debug-level) logging. Ignored when `logger` is supplied. */
  verbose?: boolean;
  /** Exit (return `false`) if the report contains any failed tests. */
  failOnFailures?: boolean;
  /** Custom logger; defaults to a winston console logger created via {@link createLogger}. */
  logger?: MinimalLogger;
}

export function collectTestsByType(args: { type: string; suiteList: MochaSuite[] }): CollectedTest[];

export function configureProgram(): Command;

/** Runs the full conversion pipeline. Returns `true` on success, `false` if validation/conversion failed or (with `failOnFailures`) the report contains failures. Never throws. */
export function convertMochaToMarkdown(options: ConvertMochaToMarkdownOptions): boolean;

export function createLogger(verbose?: boolean): Logger;

export function extractTestResultsInfo(testResults: MochaTestResults): ExtractedTestResultsInfo;

export function readJsonFile(filePath: string, logger?: MinimalLogger): unknown;

/** Parses `argv` with commander and runs the conversion, setting `process.exitCode` on failure. */
export function runCli(argv?: string[]): void;

export function validateCliOptions(options: { path: string; output: string; template: string }): void;

export function validateTestResultsSchema(testResults: unknown): MochaTestResults;
