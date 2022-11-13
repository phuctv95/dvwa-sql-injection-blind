export function generateNumbers(from: number, to: number): number[] {
  const length = to - from + 1;
  return [...Array(length).keys()].map((x) => x + from);
}
