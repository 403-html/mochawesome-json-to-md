import type Mochawesome from "mochawesome";

export type TestResultsTypes = "passes" | "failures" | "pending" | "skipped";
export type TestWithFilePath = Mochawesome.PlainTest & { path: string };
export type ExtractedTestsByType = Record<TestResultsTypes, TestWithFilePath[]>;
export type ExtractedReport = {
  meta?: Partial<Mochawesome.OutputMeta>;
  stats?: Partial<Mochawesome.OutputStats>;
  tests?: ExtractedTestsByType;
};
export type MockedExtractedReport = Pick<
  Mochawesome.Output,
  "meta" | "stats"
> & {
  tests: ExtractedTestsByType;
  results?: Mochawesome.PlainSuite[];
};
