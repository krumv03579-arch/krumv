export interface DbProduct {
  id: string;
  user_id: string;
  title: string;
  team: string;
  size: "S" | "M" | "L" | "XL";
  price: number;
  condition: "새상품" | "중고";
  description: string | null;
  images: string[];
  created_at: string;
  updated_at: string;
}

export const SIZES = ["S", "M", "L", "XL"] as const;
export const CONDITIONS = ["새상품", "중고"] as const;

export const PRICE_RANGES = [
  { label: "전체", min: 0, max: Number.POSITIVE_INFINITY },
  { label: "5만원 이하", min: 0, max: 50000 },
  { label: "5–10만원", min: 50000, max: 100000 },
  { label: "10–15만원", min: 100000, max: 150000 },
  { label: "15만원 이상", min: 150000, max: Number.POSITIVE_INFINITY },
];

export function formatKRW(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}일 전`;
  return new Date(iso).toLocaleDateString("ko-KR");
}

export function sellerHandle(userId: string) {
  return userId.slice(0, 8);
}

export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect width='400' height='400' fill='#f1f5f9'/><text x='200' y='210' text-anchor='middle' font-family='Inter, sans-serif' font-size='18' fill='#94a3b8'>이미지 없음</text></svg>`,
  );