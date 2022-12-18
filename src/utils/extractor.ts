import type Mochawesome from "mochawesome";
import type {
  TestResultsTypes,
  TestWithFilePath,
  ExtractedTestsByType,
} from "./extractor.d";

export const findTestsByTypeInDirectoryTree = ({
  type,
  dir,
  path = dir.file,
  cache = [],
}: {
  type: TestResultsTypes;
  dir: Mochawesome.PlainSuite;
  path?: string;
  cache?: TestWithFilePath[];
}): TestWithFilePath[] => {
  const localCache: TestWithFilePath[] = cache;

  if (dir[type].length > 0) {
    for (const uuid of dir[type]) {
      const foundTestByUuid = dir.tests.find((test) => test.uuid === uuid);
      if (foundTestByUuid) {
        localCache.push({
          ...foundTestByUuid,
          path,
        });
      }
    }
  }
  if (dir.suites.length > 0) {
    for (const suit of dir.suites) {
      findTestsByTypeInDirectoryTree({
        type: type,
        dir: suit,
        path,
        cache: localCache,
      });
    }
  }

  return localCache;
};

export const extractTestsByType = (
  results: Mochawesome.PlainSuite[]
): ExtractedTestsByType => {
  const testsByType: ExtractedTestsByType = {
    passes: [],
    failures: [],
    pending: [],
    skipped: [],
  };

  for (const dir of results) {
    for (const type of Object.keys(testsByType) as TestResultsTypes[]) {
      const tests = findTestsByTypeInDirectoryTree({
        type,
        dir,
      });
      testsByType[type] = [...testsByType[type], ...tests];
    }
  }

  return testsByType;
};
