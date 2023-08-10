import { templatesBubble} from "./templates";

const dbIdToAlgorithmId = {
  0: 1, // Bubble Sort
  1: 1, // Bubble Sort
};

const algorithmsIdToTemplate = {
  1: templatesBubble,
};

const algorithmsIdToName = {
  1: "bubbleSort",
};

export { algorithmsIdToTemplate, algorithmsIdToName, dbIdToAlgorithmId };
