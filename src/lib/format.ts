/** Number/text formatting shared across deluxla screens. */

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

/** "방금 전", "12분 전", "3시간 전", "2일 전" — client-side only. */
export function relativeTime(timestamp: number): string {
  const minutes = Math.floor((Date.now() - timestamp) / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}
