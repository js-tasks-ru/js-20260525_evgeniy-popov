/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  let result = '';
  let individualString = '';

  for (let i = 0; i < string.length; i++) {
    individualString += string[i];
    if (string[i] !== string[i + 1]) {
      result += individualString.slice(0, size);
      individualString = '';
    }
  }

  return result;
}
