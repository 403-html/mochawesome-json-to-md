export const collectTestsByType = ({ type, suiteList }) => {
  const collected = [];
  const queue = suiteList.map((suite) => ({ suite, path: suite.file || '' }));

  while (queue.length > 0) {
    const { suite, path } = queue.shift();
    const typeList = Array.isArray(suite[type]) ? suite[type] : [];
    const tests = Array.isArray(suite.tests) ? suite.tests : [];
    const childSuites = Array.isArray(suite.suites) ? suite.suites : [];

    for (const uuid of typeList) {
      const foundTestByUuid = tests.find((test) => test.uuid === uuid);
      if (!foundTestByUuid) {
        throw new Error(`Test with uuid ${uuid} not found for type ${type}`);
      }
      collected.push({ ...foundTestByUuid, path });
    }

    for (const subSuite of childSuites) {
      queue.push({ suite: subSuite, path: subSuite.file || path });
    }
  }

  return collected;
};

export const extractTestResultsInfo = ({ results, stats }) => {
  const { start: startDate, duration, tests: totalTests, other: otherTests } = stats;

  const testTypes = ['passes', 'failures', 'pending', 'skipped'];
  const categorizedTests = testTypes.map((type) =>
    collectTestsByType({
      type,
      suiteList: results,
    })
  );

  const [passedTests, failedTests, skippedTests, skippedOtherTests] = categorizedTests;

  return {
    startDate,
    duration,
    passedTestsCount: passedTests.length,
    failedTestsCount: failedTests.length,
    skippedTestsCount: skippedTests.length,
    skippedOtherTestsCount: skippedOtherTests.length,
    otherTestsCount: otherTests,
    totalTests,
    passedExists: passedTests.length > 0,
    failedExists: failedTests.length > 0,
    skippedExists: skippedTests.length > 0,
    skippedOtherExists: skippedOtherTests.length > 0,
    passedTests,
    failedTests,
    skippedTests,
    skippedOtherTests,
  };
};
