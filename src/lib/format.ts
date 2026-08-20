/** Number/text formatting shared across pulseroom screens. */

/** 3241 → "3.2k", 1284000 → "128.4만" — matches how counts read in the UI. */
export function compact(n: number): string {
  if (n >= 10000) {
    const man = n / 10000;
    return `${man >= 100 ? Math.round(man) : Math.round(man * 10) / 10}만`;
  }
  if (n >= 1000) return `${Math.round(n / 100) / 10}k`;
  return String(n);
}

/** 1284 → "1,284" */
export function comma(n: number): string {
  return n.toLocaleString("ko-KR");
}
