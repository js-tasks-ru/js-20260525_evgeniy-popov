/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  if (!path) {
    return;
  }

  return (obj) => {
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
      if (result == null || !Object.hasOwn(result, key)) {
        return undefined;
      }

      result = result[key];
    }
    return result;
  };
}
