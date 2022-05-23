/** 
 * Method that compare two simple arrays
 * @param  {Array} firstArray
 * @param  {Array} secondArray
 * @return {boolean} true or false
 */
export function isEqual(firstArray, secondArray) {
  if (!firstArray || !secondArray || firstArray.length !== secondArray.length) {
    return false;
  }
  const uniqueValues = new Set([...firstArray, ...secondArray]);
  for (const value of uniqueValues) {
    const firstArrayCount = firstArray.filter(item => item === value).length;
    const secondArrayCount = secondArray.filter(item => item === value).length;
    if (firstArrayCount !== secondArrayCount) {
      return false;
    }
  }
  return true
}

/**
 * Metod that sort Object Array by String field
 * @param {Array} array to be sort
 * @param {field} field in the object, pe [{name:'pepito'}] field=name
 * @return {Array}
 */
export function sortArrayObject(array, field) {
  if (!array || !array.length) {
    return [];
  }
  return array.sort((a, b) => {
    const tempA = a[field].toUpperCase();
    const tempB = b[field].toUpperCase();
    if (tempA < tempB) {
      return -1;
    }
    if (tempA > tempB) {
      return 1;
    }
    return 0;
  })
}