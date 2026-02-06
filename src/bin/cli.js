import { program } from 'commander';

import { convertMochaToMarkdown } from '../services/converter.js';

const configureProgram = () => {
  return program
    .requiredOption('-p, --path <path>', 'Specify the path to the report')
    .option(
      '-o, --output <output>',
      'Specify the path for the markdown file',
      './md-reports/output.md'
    )
    .option(
      '-t, --template <template>',
      'Specify the path to the template file',
      './sample-template.md'
    )
    .option('-T, --title <title>', 'Specify the title for the report', 'Test Report')
    .option('-v, --verbose', 'Enable verbose mode for debug logging')
    .usage('$0 -p file/path.json [options]')
    .addHelpText(
      'after',
      '\nFor more information, visit https://github.com/403-html/mochawesome-json-to-md'
    );
};

const runCli = (argv = process.argv) => {
  configureProgram().parse(argv);
  const succeeded = convertMochaToMarkdown(program.opts());
  if (!succeeded) {
    process.exitCode = 1;
  }
};

export { configureProgram, runCli };
