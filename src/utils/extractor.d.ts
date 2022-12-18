import type Mochawesome from "mochawesome";

export type TestResultsTypes = "passes" | "failures" | "pending" | "skipped";
export type TestWithFilePath = Mochawesome.PlainTest & { path: string };
export type ExtractedTestsByType = Record<TestResultsTypes, TestWithFilePath[]>;
