import { encode } from "../Utils";
import config from "../Config";

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
  //The maximum is exclusive and the minimum is inclusive
}

function randomArray(n, minValue, maxValue) {
  return Array.from(Array(n)).map((x) => getRandomInt(minValue, maxValue));
}

const compare = (a, b) => {
  return a - b;
};

const generateTests = (algorithmId) => {
  const inputs = [];
  const outputs = [];
  const { testCasesCount } = config;

  const { lengthArray, minValue, maxValue } = config[algorithmId];
  for (let i = 0; i < testCasesCount; i++) {
    let n = getRandomInt(0, lengthArray + 1);
    let A = randomArray(n, minValue, maxValue + 1);
    let S = [...A].sort(compare);
    inputs[i] = `${n}\n${A.join(" ")}`;
    outputs[i] = `${S.join(" ")}`;
  }
  const testCases = {
    inputs,
    outputs,
  };
  const encodedTestCases = {
    inputs: inputs.map((x) => encode(x)),
    outputs: outputs.map((x) => encode(x)),
  };
  console.log(testCases);
  console.log(encodedTestCases);
  return encodedTestCases;
};

export default generateTests;
