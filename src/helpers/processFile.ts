import fs from "fs";

export const readReport = (path: string) => {
  return JSON.parse(fs.readFileSync(path, "utf8"));
};
