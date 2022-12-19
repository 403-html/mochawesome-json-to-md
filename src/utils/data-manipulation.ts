import type Mochawesome from "mochawesome";

import { extractTestsByType } from "./extractor";

export const parseJson = ({ results, stats, meta }: Mochawesome.Output) => {
  const tests = extractTestsByType(results as Mochawesome.PlainSuite[]);
  return { tests, stats, meta };
};
