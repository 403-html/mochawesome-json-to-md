export const generateMarkdown = (obj: object, template: string): string => {
  // Cache the regular expressions if they were not provided
  const blockRegex = /\{\{(.*?)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
  const singleRegex = /\{\{(.*?)\}\}/g;

  // Extract the logic for replacing block tags and single tags into separate functions
  const replaceBlockTags = (
    _match: string,
    key: string,
    nestedTemplate: string
  ) => {
    if (obj.hasOwnProperty(key) && Array.isArray(obj[key])) {
      return obj[key]
        .map((item) => {
          return generateMarkdown(item, nestedTemplate.trim());
        })
        .join("\n");
    } else if (obj.hasOwnProperty(key) && typeof obj[key] === "object") {
      return generateMarkdown(obj[key], nestedTemplate.trim());
    }
  };
  const replaceSingleTags = (_match: string, key: string) => {
    if (
      obj.hasOwnProperty(key) &&
      !(typeof obj[key] === "object" || Array.isArray(obj[key]))
    ) {
      return obj[key];
    }
  };

  const isArrayAndEmpty = Array.isArray(obj) && obj.length === 0;
  const isObjAndEmpty =
    typeof obj === "object" && Object.keys(obj).length === 0;
  const isTemplateEmpty = template === "";

  if (isArrayAndEmpty || isObjAndEmpty || isTemplateEmpty) {
    return template;
  }

  // Replace block tags
  template = template.replace(blockRegex, replaceBlockTags);

  // Replace single tags
  template = template.replace(singleRegex, replaceSingleTags);

  return template;
};
