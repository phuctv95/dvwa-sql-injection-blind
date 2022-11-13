/**
 * Search for an item using Binary Search algorithm.
 * @param arr the array want to search in.
 * @param lt the *predicate* method, return true if the passed `midItem` is less than the target item, otherwise false.
 * @param gt the *predicate* method, return true if the passed `midItem` is greater than the target item, otherwise false.
 * @returns the index of target item, or -1 if not found.
 */
export async function binarySearch<T>(
  arr: T[],
  lt: (midItem: T) => Promise<boolean>,
  gt: (midItem: T) => Promise<boolean>
) {
  let l = 0;
  let r = arr.length - 1;
  while (l <= r) {
    let m = Math.floor((l + r) / 2);
    if (await lt(arr[m])) {
      l = m + 1;
    } else if (await gt(arr[m])) {
      r = m - 1;
    } else {
      return m;
    }
  }
  return -1;
}
