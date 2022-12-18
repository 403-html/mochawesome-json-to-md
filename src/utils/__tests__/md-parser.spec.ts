import {generateMarkdown} from "../md-parser";

describe("generateMarkdown", () => {
  it("should replace single tag template", () => {
    const template = `# {{title}}
{{date}}
{{items}}
`;

    const data = {
      title: "Hello",
      items: "one",
      date: new Date("2020-01-01").toISOString(),
    };
    const result = generateMarkdown(data, template);
    expect(result).toBe(`# Hello
${data.date}
one
`);
  });

  it("should replace nested template with array", () => {
    const obj = {
      title: "My Document",
      sections: [
        {
          heading: "Introduction",
          content: "This is the introduction to my document.",
        },
        {
          heading: "Conclusion",
          content: "This is the conclusion to my document.",
        },
      ],
    };

    const template = `# {{title}}

{{sections}}
## {{heading}}
{{content}}
{{/sections}}
`;
    const result = generateMarkdown(obj, template);

    expect(result).toBe(`# My Document

## Introduction
This is the introduction to my document.
## Conclusion
This is the conclusion to my document.
`);
  });

  it("should replace nested template with obj", () => {
    const obj = {
      title: "My Document",
      sections: {
        heading: "Introduction",
        content: "This is the introduction to my document.",
      },
    };

    const template = `# {{title}}

{{sections}}
## {{heading}}
{{content}}
{{/sections}}
`;
    const result = generateMarkdown(obj, template);

    expect(result).toBe(`# My Document

## Introduction
This is the introduction to my document.
`);
  });

  it("should replace nested template with array and obj", () => {
    const obj = {
      title: "My Document",
      sections: [
        {
          heading: "Introduction",
          content: "This is the introduction to my document.",
        },
        {
          heading: "Conclusion",
          content: "This is the conclusion to my document.",
        },
      ],
      other: {
        heading: "Other",
        content: "This is the other section.",
      },
    };

    const template = `# {{title}}

{{sections}}
## {{heading}}
{{content}}
{{/sections}}

{{other}}
## {{heading}}
{{content}}
{{/other}}
`;
    const result = generateMarkdown(obj, template);

    expect(result).toBe(`# My Document

## Introduction
This is the introduction to my document.
## Conclusion
This is the conclusion to my document.

## Other
This is the other section.
`);
  });

  it("should return the template if obj is empty", () => {
    const obj = {};
    const template = `# {{title}}
{{date}}
{{items}}
`;
    const result = generateMarkdown(obj, template);
    expect(result).toBe(template);
  });

  it("should return the template if obj is array and it is empty", () => {
    const obj = [];
    const template = `# {{title}}
{{date}}
{{items}}
`;
    const result = generateMarkdown(obj, template);
    expect(result).toBe(template);
  });

  it("should return the template if template is empty", () => {
    const obj = {
      title: "Hello",
      items: "one",
      date: new Date("2020-01-01").toISOString(),
    };
    const template = "";
    const result = generateMarkdown(obj, template);
    expect(result).toBe(template);
  });
});
