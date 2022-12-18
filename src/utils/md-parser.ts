export const generateMarkdown = (obj: object, template: string): string => {
  const isArrayAndEmpty = Array.isArray(obj) && obj.length === 0;
  const isObjAndEmpty =
    typeof obj === "object" && Object.keys(obj).length === 0;
  const isTemplateEmpty = template === "";

  if (isArrayAndEmpty || isObjAndEmpty || isTemplateEmpty) {
    return template;
  }

  // Replace block of tags
  const regex = /\{\{(.*?)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
  template = template.replace(regex, (_match, key, nestedTemplate) => {
    if (obj.hasOwnProperty(key) && Array.isArray(obj[key])) {
      return obj[key]
        .map((item) => {
          return generateMarkdown(item, nestedTemplate.trim());
        })
        .join("\n");
    } else if (obj.hasOwnProperty(key) && typeof obj[key] === "object") {
      return generateMarkdown(obj[key], nestedTemplate.trim());
    }
  });

  // Replace single tags
  const regex2 = /\{\{(.*?)\}\}/g;
  template = template.replace(regex2, (_match, key) => {
    if (
      obj.hasOwnProperty(key) &&
      !(typeof obj[key] === "object" || Array.isArray(obj[key]))
    ) {
      return obj[key];
    }
  });

  return template;
};
