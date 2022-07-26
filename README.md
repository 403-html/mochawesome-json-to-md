# mochawesome-json-to-md

## Table of contents

- [mochawesome-json-to-md](#mochawesome-json-to-md)
  - [Table of contents](#table-of-contents)
  - [About](#about)
  - [How do I get started?](#how-do-i-get-started)
  - [Arguments](#arguments)
  - [Templates](#templates)
    - [Writing own templates](#writing-own-templates)
  - [Where can I get more help, if I need it?](#where-can-i-get-more-help-if-i-need-it)
  - [How I can contribute to the project?](#how-i-can-contribute-to-the-project)
  - [Plans and achievements for this project](#plans-and-achievements-for-this-project)
  - [License](#license)
  - [Author](#author)

## About

`mochawesome-json-to-md` is a solution for formatting, transforming, and styling all of your JSON reports easily. Tool provides a simple way to translate the extensive reports from your [mochawesome](https://www.npmjs.com/package/mochawesome) and [mochawesome-merge](https://www.npmjs.com/package/mochawesome-merge) JSON reports into markdown format, with order you prefer. I like mochawesome, but who doesn't love readabilty more?

## How do I get started?

Install package

```sh
npm install -g mochawesome-json-to-md
```

run the script

```sh
mochawesome-json-to-md -p ./your/file/path.json -o ./generated.md [args]
```

that's it! You've successfuly converted json report to _slick_ md report.

## Arguments

| Argument | Required | Description | Default |
| -------- | ----------- | ------- | -------- |
| -p, --path | `true` | Path to JSON report file | - |
| -o, --output | `false` | Path to output file | `./generated.md` |
| -t, --template | `false` | Path to template file | `${dist_script_pwd}/../default.template.md` |
| -v, --version | `false` | Print version | - |
| -h, --help | `false` | Print help | - |

## Templates

### Writing own templates

## Where can I get more help, if I need it?

Just write the issue. I'll try to answer as fast as possible.

## How I can contribute to the project?

You can contribute to the project by opening an issue or creating a pull request.

But first, please, read the [Contributing](./CONTRIBUTING.md#Contributing) file. It contains all the rules and guidelines for the project. If you have any questions, please, ask them in the [Issues](https://github.com/403-html/mochawesome-json-to-md/issues) section. I'll try to answer as fast as possible.

## Plans and achievements for this project

- [x] <s> Read and process passed arguments </s>
- [x] <s> Create function for "semi-dynamic" markdown template creation </s>
- [x] <s> Read json report </s>
- [x] <s> Grab all needed information </s>
- [x] <s> Grab all possible tests by type and store them together by type (recurrence) </s>
- [x] <s> Save markdown with created "semi-dynamic" markdown template and return there only informations passed as arguments </s>
- [x] <s> Create fully customizable markdown template with tags </s>
- [x] <s> Remove need of all boolean arguments and depends only on customizable markdown template with tags </s>
- [x] <s> Remove need of `lodash` package </s>
- [x] <s> Remove/find substitute for `yargs` package </s>
- [x] <s> Add support for TypeScript </s>
- [x] <s> Add sample markdown template </s>
- [ ] Add unit tests (topic started in [this issue](https://github.com/403-html/mochawesome-json-to-md/issues/5))
- [ ] Rewrite and add more documentation
  - [ ] Readme
  - [x] <s> Contributing guidelines </s>
  - [ ] Code of conduct
- [x] <s> Add workflow for automated semantic versioning </s>
- [x] <s> Move to yarn </s>

## License

MIT

## Author

Tymoteusz `@403-html` Stępień
