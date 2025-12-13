const baseTest = (uuid, title, state) => ({
  uuid,
  title,
  fullTitle: title,
  timedOut: false,
  duration: 5,
  state,
  speed: 'fast',
  pass: state === 'pass',
  fail: state === 'fail',
  pending: state === 'pending',
  context: null,
  code: '// test code',
  err: state === 'fail' ? { message: 'boom', estack: 'stack', diff: 'diff' } : {},
  parentUUID: 'root',
  isHook: false,
  skipped: state === 'skipped',
});

const singleOutcomeReport = {
  stats: {
    start: '2024-01-01T00:00:00Z',
    duration: 12,
    tests: 4,
    other: 1,
  },
  results: [
    {
      file: '/tests/suite-a.js',
      passes: ['p-1'],
      failures: ['f-1'],
      pending: ['pd-1'],
      skipped: ['s-1'],
      suites: [],
      tests: [
        baseTest('p-1', 'pass test', 'pass'),
        baseTest('f-1', 'fail test', 'fail'),
        baseTest('pd-1', 'pending test', 'pending'),
        baseTest('s-1', 'skipped test', 'skipped'),
      ],
    },
  ],
};

const multiReport = {
  stats: {
    start: '2024-01-02T00:00:00Z',
    duration: 24,
    tests: 6,
    other: 0,
  },
  results: [
    {
      file: '/tests/suite-b.js',
      passes: ['p-2'],
      failures: [],
      pending: [],
      skipped: ['s-2'],
      suites: [],
      tests: [baseTest('p-2', 'pass b', 'pass'), baseTest('s-2', 'skipped b', 'skipped')],
    },
    {
      file: '/tests/suite-c.js',
      passes: ['p-3'],
      failures: ['f-3'],
      pending: ['pd-3'],
      skipped: [],
      suites: [],
      tests: [
        baseTest('p-3', 'pass c', 'pass'),
        baseTest('f-3', 'fail c', 'fail'),
        baseTest('pd-3', 'pending c', 'pending'),
      ],
    },
  ],
};

const nestedReport = {
  stats: {
    start: '2024-01-03T00:00:00Z',
    duration: 30,
    tests: 4,
    other: 2,
  },
  results: [
    {
      file: '/tests/root.js',
      passes: ['root-pass'],
      failures: [],
      pending: [],
      skipped: [],
      suites: [
        {
          file: '/tests/root.js',
          passes: [],
          failures: ['child-fail'],
          pending: [],
          skipped: [],
          suites: [
            {
              file: '/tests/root.js',
              passes: [],
              failures: [],
              pending: ['deep-pending'],
              skipped: ['deep-skipped'],
              suites: [],
              tests: [
                baseTest('deep-pending', 'deep pending', 'pending'),
                baseTest('deep-skipped', 'deep skipped', 'skipped'),
              ],
            },
          ],
          tests: [baseTest('child-fail', 'child fail', 'fail')],
        },
      ],
      tests: [baseTest('root-pass', 'root pass', 'pass')],
    },
  ],
};

module.exports = {
  multiReport,
  nestedReport,
  singleOutcomeReport,
};
