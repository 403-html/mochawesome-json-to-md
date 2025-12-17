import fs from 'fs';
import path from 'path';
import mustache from 'mustache';

import { createLogger } from '../config/logger.js';
import { validateCliOptions } from '../domain/cli-options.js';
import { extractTestResultsInfo } from '../domain/extraction.js';
import { validateTestResultsSchema } from '../domain/schema.js';
import { readJsonFile } from './report-reader.js';

let logger = createLogger(false);

const setLogger = (nextLogger) => {
  logger = nextLogger;
};

const ensureOutputDirectory = (outputPath) => {
  const outputDir = path.dirname(outputPath);
  logger.info(`Ensuring output directory: ${outputDir}`);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
};

const renderMarkdown = ({ templatePath, templateArgs }) => {
  logger.info(`Reading template file: ${templatePath}`);
  const templateContent = fs.readFileSync(templatePath, 'utf-8');

  logger.info('Rendering template with test results');
  return mustache.render(templateContent, templateArgs);
};

const convertMochaToMarkdown = (options) => {
  const { path: reportPath, output, template, title, verbose } = options;
  setLogger(createLogger(Boolean(verbose)));
  try {
    validateCliOptions({ path: reportPath, output, template });

    logger.info('Starting Mocha to Markdown conversion');
    logger.info(`Reading test results from: ${reportPath}`);
    const testResults = validateTestResultsSchema(readJsonFile(reportPath, logger));

    logger.info('Extracting test results information');
    const extractedInfo = extractTestResultsInfo(testResults);

    const renderedMarkdown = renderMarkdown({
      templatePath: template,
      templateArgs: { ...extractedInfo, title },
    });

    ensureOutputDirectory(output);

    logger.info(`Writing markdown to: ${output}`);
    fs.writeFileSync(output, renderedMarkdown);
  } catch (error) {
    logger.error(error.message);
    process.exitCode = 1;
  }
};

export { convertMochaToMarkdown };
