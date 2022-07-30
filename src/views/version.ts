export const versionScreen = () => {
  console.info(`v${require("../../package.json").version}`);
  process.exit(1);
};
