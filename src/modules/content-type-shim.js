import * as ct from "content-type";

const defaultContentType = {
  type: "",
  parameters: Object.create(null),
};
Object.freeze(defaultContentType.parameters);
Object.freeze(defaultContentType);

function safeParse(input) {
  if (typeof input !== "string") return defaultContentType;
  try {
    return ct.parse(input);
  } catch {
    return defaultContentType;
  }
}

export { ct as parse, safeParse, defaultContentType };
export default { parse: ct.parse, safeParse, defaultContentType };