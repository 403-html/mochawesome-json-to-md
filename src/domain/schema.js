export const validateTestResultsSchema = (testResults) => {
  if (!testResults || typeof testResults !== 'object') {
    throw new Error('Test results must be an object');
  }

  const { results, stats } = testResults;
  if (!Array.isArray(results)) {
    throw new Error('Test results must include a "results" array');
  }

  if (!stats || typeof stats !== 'object') {
    throw new Error('Test results must include a "stats" object');
  }

  const requiredStats = ['start', 'duration', 'tests', 'other'];
  for (const statKey of requiredStats) {
    if (stats[statKey] === undefined || stats[statKey] === null) {
      throw new Error(`Stats missing required field "${statKey}"`);
    }
  }

  return { results, stats };
};
