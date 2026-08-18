// Type-only smoke check for index.d.ts, run via `npm run typecheck`.
// Not published (see package.json "files") and not executed at runtime.
import {
  collectTestsByType,
  configureProgram,
  convertMochaToMarkdown,
  createLogger,
  extractTestResultsInfo,
  readJsonFile,
  runCli,
  validateCliOptions,
  validateTestResultsSchema,
} from '../index.js';

const logger = createLogger(true);

const testResults = validateTestResultsSchema({
  results: [],
  stats: { start: '2024-01-01T00:00:00Z', duration: 0, tests: 0, other: 0 },
});

const info = extractTestResultsInfo(testResults);
const passRate: number = info.passRate;
const failedCount: number = info.failedTestsCount;

const collected = collectTestsByType({ type: 'passes', suiteList: testResults.results });
const firstPath: string | undefined = collected[0]?.path;

validateCliOptions({ path: 'a', output: 'b', template: 'c' });

const succeeded: boolean = convertMochaToMarkdown({
  path: 'a',
  output: 'b',
  template: 'c',
  title: 'Title',
  verbose: true,
  failOnFailures: true,
  logger,
});

readJsonFile('a', logger);
configureProgram();
runCli(['node', 'index.js']);

void passRate;
void failedCount;
void firstPath;
void succeeded;
