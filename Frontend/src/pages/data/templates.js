import headers from "./headers";
import { bodyBubble } from "./functionBody";
import { mainBubble } from "./main";

const generateFinalCode = (header, code, main) => {
  return header + "\n\n" + code + "\n\n" + main;
};

const templatesBubble = Object.keys(mainBubble).reduce((accumulator, key) => {
  return {
    ...accumulator,
    [key]: generateFinalCode(headers[key], bodyBubble[key], mainBubble[key]),
  };
}, {});

export { templatesBubble };
