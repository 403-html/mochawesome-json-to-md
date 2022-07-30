import { white, green } from "colorette";
import { t } from "./../helpers";

interface ArgvListI {
  argvs: string[];
  default?: string;
  description: string;
}

const argvList: ArgvListI[] = [
  {
    argvs: ["--path", "-p"],
    description: t("args:path")
  },
  {
    argvs: ["--output", "-o"],
    default: "./generated-report.md",
    description: t("args:output")
  },
  {
    argvs: ["--template", "-t"],
    default: "../template.md",
    description: t("args:template")
  },
  {
    argvs: ["--help", "-h"],
    description: t("args:help")
  }
];

const normalizeArgvsName = (): void => {
  const allArgvs = argvList.map((argv) => argv.argvs.join(", "));
  const longestArgv: string = allArgvs.reduce((longest, current) =>
    current.length > longest.length ? current : longest
  );
  const diffProcessedArgvs: string[] = allArgvs.map((argv) => {
    const diff = longestArgv.length - argv.length;
    const spaces = " ".repeat(diff);
    return `${argv}${spaces}`;
  });
  argvList.forEach((argument, index) => {
    do {
      argument.argvs.pop();
    } while (argument.argvs.length > 0);
    argument.argvs.push(diffProcessedArgvs[index]);
  });
};

const argvsString = (): string => {
  normalizeArgvsName();
  return argvList
    .map((argv) =>
      argv.default
        ? `${green(argv.argvs.pop())} ${t("help:default")} ${green(
            argv.default
          )}; ${white(argv.description)}`
        : `${green(argv.argvs.pop())}; ${white(argv.description)}`
    )
    .join("\n");
};

const helpText = (): string => `${white(
  `${t("help:usage")} ${green(t("help:usagecommand"))}`
)}

${white(t("help:scriptdescription"))}

${white(t("help:argumentsheader"))}
${argvsString()}

${white(
  `${t("help:helprun")} ${green(t("help:helpcommand"))} ${t("help:run1")}`
)}

${white(`${t("help:moreinfo")} ${green(t("help:moreinfourl"))}`)}`;

const helpScreen = () => {
  console.info(helpScreen);
  process.exit(1);
};

export { helpScreen };
