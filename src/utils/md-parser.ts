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
    const hasKey = Object.prototype.hasOwnProperty.call(obj, key);
    const isValueArray = Array.isArray(obj[key]);
    const isValueObject = typeof obj[key] === "object";

    if (hasKey && isValueArray) {
      return obj[key]
        .map((item) => {
          return generateMarkdown(item, nestedTemplate.trim());
        })
        .join("\n");
    } else if (hasKey && isValueObject) {
      return generateMarkdown(obj[key], nestedTemplate.trim());
    }
  };
  const replaceSingleTags = (_match: string, key: string) => {
    const hasKey = Object.prototype.hasOwnProperty.call(obj, key);
    const isValueObjectOrArray =
      typeof obj[key] === "object" || Array.isArray(obj[key]);

    const shouldReplace = hasKey && !isValueObjectOrArray;

    if (shouldReplace) {
      return obj[key];
    }
  };

  const isArrayAndEmpty = Array.isArray(obj) && obj.length === 0;
  const isObjAndEmpty =
    typeof obj === "object" && Object.keys(obj).length === 0;
  const isTemplateEmpty = template === "";

  const isEmpty = isArrayAndEmpty || isObjAndEmpty || isTemplateEmpty;

  if (isEmpty) {
    return template;
  }

  // Replace block tags
  template = template.replace(blockRegex, replaceBlockTags);

  // Replace single tags
  template = template.replace(singleRegex, replaceSingleTags);

  return template;
};
