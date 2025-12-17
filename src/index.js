import { configureProgram, runCli } from './bin/cli.js';
import { createLogger } from './config/logger.js';
import { validateCliOptions } from './domain/cli-options.js';
import { collectTestsByType, extractTestResultsInfo } from './domain/extraction.js';
import { validateTestResultsSchema } from './domain/schema.js';
import { convertMochaToMarkdown } from './services/converter.js';
import { readJsonFile } from './services/report-reader.js';

export {
  collectTestsByType,
  configureProgram,
  convertMochaToMarkdown,
  createLogger,
  extractTestResultsInfo,
  readJsonFile,
  runCli,
  validateCliOptions,
  validateTestResultsSchema,
};
