/**
 * deluxta mock data.
 *
 * deluxta is a Korean proxy-purchase / forwarding service (해외역직구): overseas
 * buyers shop Korean stores through us, we pay the seller, consolidate the
 * parcels in our warehouse and ship them out.
 *
 * The product is at the front-end stage, so every screen renders from this
 * module. Stores are real Korean shopping destinations; the listings below are
 * sample rows with placeholder artwork from `public/img`.
 */

export type StoreKey =
  "oliveyoung" | "bunjang" | "fansshop" | "ktown4u" | "yes24";

export type Store = {
  key: StoreKey;
  /** Display name on the tile and the section heading. */
  name: string;
  /** One line describing what the store sells, used on the tile tooltip. */
  blurb: string;
  /** Tailwind classes tinting the inline logo mark. */
  logoClass: string;
};

export const stores: Store[] = [
  {
    key: "oliveyoung",
    name: "Olive Young",
    blurb: "K-뷰티 화장품·헬스케어",
    logoClass: "text-[#8bc53f]",
  },
  {
    key: "bunjang",
    name: "Bunjang",
    blurb: "중고 굿즈·포토카드 거래",
    logoClass: "text-[#6b4dff]",
  },
  {
    key: "fansshop",
    name: "FANS SHOP",
    blurb: "공식 팬 굿즈·응원봉",
    logoClass: "text-foreground",
  },
  {
    key: "ktown4u",
    name: "Ktown4u",
    blurb: "K-POP 앨범·특전",
    logoClass: "text-[#1e6bff]",
  },
  {
    key: "yes24",
    name: "yes24",
    blurb: "도서·음반·공연 티켓",
    logoClass: "text-[#0074c8]",
  },
];

export const storeByKey = Object.fromEntries(
  stores.map((store) => [store.key, store]),
) as Record<StoreKey, Store>;

export type Product = {
  id: string;
  store: StoreKey;
  /** Seller/brand line printed above the title. */
  brand: string;
  title: string;
  image: string;
  /** Selling price in USD — buyers shop in their own currency. */
  price: number;
  /** List price before the store discount, when there is one. */
  listPrice?: number;
};

/** Discount percentage shown in red next to the price. */
export function discountRate(product: Product): number | null {
  if (!product.listPrice || product.listPrice <= product.price) return null;
  return Math.round((1 - product.price / product.listPrice) * 100);
}

/** 20.26 → "$20.26" */
export function usd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export const products: Product[] = [
  // --- Olive Young -------------------------------------------------------
  {
    id: "oy-1",
    store: "oliveyoung",
    brand: "리쥬덱스",
    title: "(990특가) 리쥬덱스 더마 리페어링 드레싱 마스크 1매",
    image: "/img/room-blush.svg",
    price: 0.76,
  },
  {
    id: "oy-2",
    store: "oliveyoung",
    brand: "Mediheal",
    title: "[NEW] 메디힐 PDRN 캡슐 패치 펩타이드 멀티 솔루션 60+60매 기획",
    image: "/img/room-violet.svg",
    price: 20.26,
    listPrice: 34.54,
  },
  {
    id: "oy-3",
    store: "oliveyoung",
    brand: "Isoi",
    title: "[로즈PDRN/눈밑꺼짐개선] 아이소이 브라이트닝 아이&미간패치 90매",
    image: "/img/room-dawn.svg",
    price: 23.94,
    listPrice: 34.23,
  },
  {
    id: "oy-4",
    store: "oliveyoung",
    brand: "닥터지",
    title: "닥터지 레드 블레미쉬 클리어 수딩 크림 70ml 더블 기획",
    image: "/img/room-forest.svg",
    price: 26.4,
    listPrice: 38.9,
  },
  {
    id: "oy-5",
    store: "oliveyoung",
    brand: "라운드랩",
    title: "라운드랩 1025 독도 토너 500ml 대용량 리필 세트",
    image: "/img/room-amber.svg",
    price: 18.32,
  },
  {
    id: "oy-6",
    store: "oliveyoung",
    brand: "토리든",
    title: "토리든 다이브인 저분자 히알루론산 세럼 50ml 2개 기획",
    image: "/img/room-neon.svg",
    price: 21.75,
    listPrice: 29.9,
  },

  // --- Bunjang -----------------------------------------------------------
  {
    id: "bj-1",
    store: "bunjang",
    brand: "Bunjang",
    title: "징크스 팀레진 네컷포카 포카 6장 일괄",
    image: "/img/artist-lumi.svg",
    price: 16.89,
  },
  {
    id: "bj-2",
    store: "bunjang",
    brand: "Bunjang",
    title: "하츠투하츠 하투하 비공굿 포토카드 포카 양도",
    image: "/img/artist-nova.svg",
    price: 3.07,
  },
  {
    id: "bj-3",
    store: "bunjang",
    brand: "Bunjang",
    title: "가히리 20주년 팝업 츠나&리본 세트",
    image: "/img/artist-mellow.svg",
    price: 11.51,
  },
  {
    id: "bj-4",
    store: "bunjang",
    brand: "Bunjang",
    title: "아이돌리쉬 세븐 아이나나 나나세 리쿠 몬누이 인형",
    image: "/img/artist-kido.svg",
    price: 17.65,
  },
  {
    id: "bj-5",
    store: "bunjang",
    brand: "Bunjang",
    title: "명탐정 코난 30주년 기념 코믹 아크릴 스탠드 신이치&헤이지",
    image: "/img/artist-orbit.svg",
    price: 17.65,
  },
  {
    id: "bj-6",
    store: "bunjang",
    brand: "Bunjang",
    title: "투어스 소다소다 경민 위버스 지관 특전",
    image: "/img/artist-velvet.svg",
    price: 9.98,
  },

  // --- FANS SHOP ---------------------------------------------------------
  {
    id: "fs-1",
    store: "fansshop",
    brand: "FANS SHOP",
    title: "공식 응원봉 Ver.3 + 전용 스트랩 세트 (해외 배송 전용)",
    image: "/img/feed-lightstick.svg",
    price: 58.4,
    listPrice: 72.0,
  },
  {
    id: "fs-2",
    store: "fansshop",
    brand: "FANS SHOP",
    title: "2026 시즌그리팅 데스크 캘린더 + 포토북 패키지",
    image: "/img/card-festival.svg",
    price: 43.2,
  },
  {
    id: "fs-3",
    store: "fansshop",
    brand: "FANS SHOP",
    title: "월드투어 공식 MD 후디 (블랙 / M·L·XL)",
    image: "/img/feed-stage.svg",
    price: 66.9,
    listPrice: 79.0,
  },
  {
    id: "fs-4",
    store: "fansshop",
    brand: "FANS SHOP",
    title: "팬미팅 한정 아크릴 키링 랜덤 2종",
    image: "/img/card-room.svg",
    price: 12.7,
  },
  {
    id: "fs-5",
    store: "fansshop",
    brand: "FANS SHOP",
    title: "공식 슬로건 타월 + 포토카드 홀더 세트",
    image: "/img/feed-crowd.svg",
    price: 24.5,
  },
  {
    id: "fs-6",
    store: "fansshop",
    brand: "FANS SHOP",
    title: "데뷔 5주년 기념 포토 익시비션 굿즈 박스",
    image: "/img/feed-backstage.svg",
    price: 88.0,
    listPrice: 110.0,
  },

  // --- Ktown4u -----------------------------------------------------------
  {
    id: "k4-1",
    store: "ktown4u",
    brand: "Ktown4u",
    title: "정규 3집 [Paper Moon] (랜덤 Ver.) + 특전 포토카드",
    image: "/img/album-paper-moon.svg",
    price: 21.4,
    listPrice: 26.0,
  },
  {
    id: "k4-2",
    store: "ktown4u",
    brand: "Ktown4u",
    title: "미니앨범 [Afterglow] (2종 SET) + 럭키드로우",
    image: "/img/album-afterglow.svg",
    price: 40.6,
  },
  {
    id: "k4-3",
    store: "ktown4u",
    brand: "Ktown4u",
    title: "싱글 [Blue Hour] (Weverse Albums ver.)",
    image: "/img/album-blue-hour.svg",
    price: 8.67,
  },
  {
    id: "k4-4",
    store: "ktown4u",
    brand: "Ktown4u",
    title: "[Satellite] 스페셜 에디션 (POB 포스터 포함)",
    image: "/img/album-satellite.svg",
    price: 32.9,
    listPrice: 39.5,
  },
  {
    id: "k4-5",
    store: "ktown4u",
    brand: "Ktown4u",
    title: "[Echo] 리패키지 (3종 SET) 미개봉 세트",
    image: "/img/album-echo.svg",
    price: 42.68,
  },
  {
    id: "k4-6",
    store: "ktown4u",
    brand: "Ktown4u",
    title: "[Midnight] 키트 앨범 + 포토카드 6종 랜덤",
    image: "/img/album-midnight.svg",
    price: 18.2,
    listPrice: 23.0,
  },

  // --- yes24 -------------------------------------------------------------
  {
    id: "y2-1",
    store: "yes24",
    brand: "yes24",
    title: "[예스24 단독] 아티스트 포토에세이 + 엽서 세트",
    image: "/img/album-cherry.svg",
    price: 27.3,
    listPrice: 33.0,
  },
  {
    id: "y2-2",
    store: "yes24",
    brand: "yes24",
    title: "한국어 학습서 세트 (초급~중급 3권)",
    image: "/img/album-slide.svg",
    price: 46.9,
  },
  {
    id: "y2-3",
    store: "yes24",
    brand: "yes24",
    title: "OST 스페셜 LP (한정 컬러 디스크)",
    image: "/img/album-echo.svg",
    price: 54.2,
    listPrice: 62.0,
  },
  {
    id: "y2-4",
    store: "yes24",
    brand: "yes24",
    title: "베스트셀러 소설 양장본 (2026 개정판)",
    image: "/img/album-paper-moon.svg",
    price: 19.8,
  },
  {
    id: "y2-5",
    store: "yes24",
    brand: "yes24",
    title: "아트북 [무대의 뒷면] 초판 한정 특별판",
    image: "/img/album-blue-hour.svg",
    price: 38.5,
    listPrice: 45.0,
  },
  {
    id: "y2-6",
    store: "yes24",
    brand: "yes24",
    title: "공연 실황 블루레이 2disc + 포토북",
    image: "/img/album-satellite.svg",
    price: 71.4,
  },
];

export function productsByStore(key: StoreKey) {
  return products.filter((product) => product.store === key);
}

/** The three service cards sitting beside the hero banner. */
export type ServiceCard = {
  key: string;
  title: string;
  lines: string[];
  to: string;
  image: string;
};

export const serviceCards: ServiceCard[] = [
  {
    key: "instant",
    title: "즉시 결제",
    lines: ["한국 계좌 없이도", "결제 가능"],
    to: "/service",
    image: "/img/card-festival.svg",
  },
  {
    key: "manual",
    title: "수동 구매",
    lines: ["주문부터 결제까지", "대신 처리"],
    to: "/service",
    image: "/img/card-room.svg",
  },
  {
    key: "warehouse",
    title: "웨어하우스",
    lines: ["1년 무료 보관", "합배송으로 전 세계 배송"],
    to: "/warehouse",
    image: "/img/room-forest.svg",
  },
];

/** The event card pinned to the right of the store rail. */
export const featuredEvent = {
  badge: "EVENT",
  title: "신규가입 쿠폰 이벤트",
  date: "2026년 3월 24일",
  image: "/img/hero-neon.svg",
  to: "/support",
};

/** Rolling announcement inside the utility bar. */
export const announcements = [
  "🎁 신규가입 시 배송비 5,000원 쿠폰 즉시 지급!",
  "✈️ 3월 한정 — 미국·일본 노선 항공 배송비 15% 할인",
  "📦 웨어하우스 1년 무료 보관, 합배송으로 배송비 절약하세요",
];
