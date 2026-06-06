/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns the new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  if (!obj) {
    return;
  }
  const result = {};

  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      result[obj[key]] = key;
    }
  }

  return result;
}
