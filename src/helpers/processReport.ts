export const returnTestsByType = ({
  type,
  dir,
  suitPath = dir.file,
  cache = []
}: {
  type: string;
  dir: { [key: string]: any };
  suitPath?: string;
  cache?: { path: string; [key: string]: any }[];
}) => {
  let localCache = cache;
  if (dir[type].length > 0) {
    for (const uuid of dir[type]) {
      const foundTest = dir.tests.find(
        (test: { [key: string]: any }) => test.uuid === uuid
      );
      localCache.push({ type, path: suitPath, foundTest });
    }
  }

  if (dir.suites.length > 0) {
    for (const suite of dir.suites) {
      returnTestsByType({
        type,
        dir: suite,
        suitPath,
        cache: localCache
      });
    }
  }

  return localCache;
};

export const returnAllTests = (results: any) => {
  const possibleTypes = ["passes", "failures", "pending", "skipped"];
  const tests = [];

  for (const type of possibleTypes) {
    for (const result of results) {
      tests.push(...returnTestsByType({ type, dir: result }));
    }
  }

  return tests;
};
