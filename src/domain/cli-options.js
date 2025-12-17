import { statSync } from 'fs';

export const ensureFileReadable = (filePath, label) => {
  if (typeof filePath !== 'string' || filePath.trim() === '') {
    throw new Error(`${label} must be a non-empty string`);
  }

  let stats;
  try {
    stats = statSync(filePath);
  } catch (error) {
    throw new Error(`${label} not accessible: ${filePath} (${error.message})`);
  }

  if (!stats.isFile()) {
    throw new Error(`${label} is not a file: ${filePath}`);
  }
};

export const validateCliOptions = (options) => {
  ensureFileReadable(options.path, 'Input report path');
  ensureFileReadable(options.template, 'Template path');

  if (typeof options.output !== 'string' || options.output.trim() === '') {
    throw new Error('Output path must be a non-empty string');
  }
};
