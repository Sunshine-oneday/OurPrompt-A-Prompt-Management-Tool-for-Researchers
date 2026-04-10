import { asc } from "./asc.js";
export function replaceArrayItemAtIndex(array, index, newValue) {
  const output = array.slice();
  output[index] = newValue;
  return output.sort(asc);
}