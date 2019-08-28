/** array-utils.ts
  * Miscellaneous utillities for arrays. */

/** Return true if the given arrays consist of the same elements, as
  * determined by triple-equals. */
export function equalElements<T>(a1: T[], a2: T[]) : boolean
{
  if (a1.length !== a2.length) {
    return false;
  }

  for (let i in a1) {
    if (a1[i] !== a2[i]) {
      return false;
    }
  }

  return true;
}


/** Print the elements of 'arr' with 'label'. */
export function debugPrintArray(label: string, arr: any[]) : void
{
  console.log(label + " (" + arr.length + "):");
  for (let i in arr) {
    console.log("  [" + i + "]: " + JSON.stringify(arr[i]));
  }
}
