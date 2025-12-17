#!/usr/bin/env node
import fs from 'fs';
import { fileURLToPath } from 'url';

import * as api from './src/index.js';

const resolvePath = (value) => {
  try {
    return value ? fs.realpathSync(value) : '';
  } catch (error) {
    return value || '';
  }
};

const currentFilePath = resolvePath(fileURLToPath(import.meta.url));
const invokedPath = resolvePath(process.argv[1]);
const isCliExecution = invokedPath === currentFilePath;

/* istanbul ignore next */
if (isCliExecution) {
  api.runCli(process.argv);
}

export * from './src/index.js';
