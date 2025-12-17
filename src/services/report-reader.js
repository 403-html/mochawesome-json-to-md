import { readFileSync } from 'fs';

const logDebug = (logger, message) => {
  if (logger && typeof logger.debug === 'function') {
    logger.debug(message);
  }
};

export const readJsonFile = (filePath, logger) => {
  logDebug(logger, `Reading JSON file: ${filePath}`);

  const fileContent = readFileSync(filePath, 'utf-8');
  try {
    const parsed = JSON.parse(fileContent);
    logDebug(logger, `Successfully parsed JSON file: ${filePath}`);
    return parsed;
  } catch (error) {
    throw new Error(`Error while parsing JSON file: ${filePath} (${error.message})`);
  }
};
