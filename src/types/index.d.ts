interface IExtractedData {
  reportTitle?: string;
  startDate?: string;
  duration?: number;
  totalTests?: number;
  otherTests?: number;
  passed?: ITestObject[];
  failed?: ITestObject[];
  skipped?: ITestObject[];
  skippedCypress?: ITestObject[];
}

interface ITestObject {
  testName: string;
  testFilePath: string;
}
