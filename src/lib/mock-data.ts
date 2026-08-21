/**
 * deluxla mock data.
 *
 * The product is at the front-end stage: every screen renders from this module
 * so the UI can be finished before any backend exists. All artists, releases
 * and posts are fictional. Relative timestamps are stored as pre-rendered
 * strings (plus a numeric offset for sorting) so server and client markup never
 * disagree during hydration.
 */

export type ArtistKey =
  "lumi" | "nova" | "mellow" | "kido" | "orbit" | "velvet" | "aster" | "noon";

export type Artist = {
  key: ArtistKey;
  /** Short display name used on chips. */
  name: string;
  nameKo: string;
  image: string;
  cover: string;
  type: string;
  debut: string;
  agency: string;
  members: string[];
  followers: number;
  todayPosts: number;
  fandom: string;
  tagline: string;
  bio: string;
  tags: string[];
  /** Tailwind classes for the artist chip (soft tint + strong text). */
  chip: string;
  /** Solid brand color for accents. */
  accent: string;
};

export const artists: Artist[] = [
  {
    key: "lumi",
    name: "LUMI",
    nameKo: "루미",
    image: "/img/artist-lumi.svg",
    cover: "/img/feed-lightstick.svg",
    type: "4인조 걸그룹",
    debut: "2023.04.18",
    agency: "PRISM Sound",
    members: ["소야", "하린", "제이", "민초"],
    followers: 1284000,
    todayPosts: 482,
    fandom: "루미너스",
    tagline: "밤을 닮은 새로운 목소리",
    bio: "데뷔 3년 차, 야경과 계절을 노래하는 4인조 그룹. 세 번째 미니앨범 'Paper Moon'으로 첫 음악방송 1위를 기록했습니다.",
    tags: ["시티팝", "발라드", "자체제작"],
    chip: "bg-pink-50 text-pink-600 ring-pink-100",
    accent: "#ec4899",
  },
  {
    key: "nova",
    name: "NOVA",
    nameKo: "노바",
    image: "/img/artist-nova.svg",
    cover: "/img/hero-neon.svg",
    type: "5인조 보이그룹",
    debut: "2021.09.02",
    agency: "Hyperline",
    members: ["도윤", "테오", "카이", "온", "루한"],
    followers: 2130000,
    todayPosts: 987,
    fandom: "노바디",
    tagline: "무대 위에서 가장 크게 빛나는",
    bio: "퍼포먼스 강자로 불리는 5인조. 월드투어 'SIGNAL'로 12개 도시를 돌았고, 라이브 밴드 편곡 무대가 팬들의 최애 클립입니다.",
    tags: ["퍼포먼스", "월드투어", "밴드편곡"],
    chip: "bg-violet-50 text-violet-600 ring-violet-100",
    accent: "#7c5cf5",
  },
  {
    key: "mellow",
    name: "MELLOW",
    nameKo: "멜로우",
    image: "/img/artist-mellow.svg",
    cover: "/img/feed-stage.svg",
    type: "3인조 밴드",
    debut: "2020.06.11",
    agency: "Slowtape",
    members: ["하늘", "우진", "서아"],
    followers: 642000,
    todayPosts: 231,
    fandom: "멜로",
    tagline: "느리게, 오래 남는 소리",
    bio: "기타·베이스·드럼 3인조. LP 발매마다 완판을 기록하는 마니아 밴드로, 공연장 사운드 그대로를 담는 라이브 앨범이 시그니처입니다.",
    tags: ["밴드", "LP", "어쿠스틱"],
    chip: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    accent: "#16a34a",
  },
  {
    key: "kido",
    name: "KIDO",
    nameKo: "키도",
    image: "/img/artist-kido.svg",
    cover: "/img/feed-backstage.svg",
    type: "솔로 아티스트",
    debut: "2022.02.14",
    agency: "Hyperline",
    members: ["키도"],
    followers: 873000,
    todayPosts: 176,
    fandom: "키즈",
    tagline: "장르를 미끄러지듯 넘나드는",
    bio: "프로듀싱과 안무를 직접 맡는 솔로 아티스트. 싱글 'SLIDE'가 숏폼 챌린지로 역주행하며 커리어 하이를 찍었습니다.",
    tags: ["R&B", "프로듀싱", "챌린지"],
    chip: "bg-amber-50 text-amber-600 ring-amber-100",
    accent: "#d97706",
  },
  {
    key: "orbit",
    name: "ORBIT",
    nameKo: "오르빗",
    image: "/img/artist-orbit.svg",
    cover: "/img/hero-arena.svg",
    type: "7인조 보이그룹",
    debut: "2024.01.09",
    agency: "PRISM Sound",
    members: ["시온", "재이", "하루", "노아", "린", "유", "청"],
    followers: 512000,
    todayPosts: 143,
    fandom: "오르빗터",
    tagline: "가장 빠르게 궤도에 오른",
    bio: "데뷔 2년 만에 첫 단독 콘서트를 매진시킨 신인 그룹. 멤버 전원이 팬 커뮤니티에 직접 글을 남기는 것으로 유명합니다.",
    tags: ["신인", "댄스", "팬소통"],
    chip: "bg-sky-50 text-sky-600 ring-sky-100",
    accent: "#0284c7",
  },
  {
    key: "velvet",
    name: "VELVET",
    nameKo: "벨벳문",
    image: "/img/artist-velvet.svg",
    cover: "/img/feed-crowd.svg",
    type: "2인조 유닛",
    debut: "2019.11.22",
    agency: "Slowtape",
    members: ["세린", "다온"],
    followers: 398000,
    todayPosts: 88,
    fandom: "문라이터",
    tagline: "새벽 두 시의 목소리",
    bio: "보컬 듀오. 드라마 OST 강자로 알려져 있으며 소극장 투어를 고집하는 라이브형 유닛입니다.",
    tags: ["OST", "듀엣", "소극장"],
    chip: "bg-rose-50 text-rose-600 ring-rose-100",
    accent: "#e11d48",
  },
  {
    key: "aster",
    name: "ASTER",
    nameKo: "아스터",
    image: "/img/artist-aster.svg",
    cover: "/img/hero-stage.svg",
    type: "5인조 걸그룹",
    debut: "2022.08.30",
    agency: "Hyperline",
    members: ["윤", "채아", "리사", "보늬", "해"],
    followers: 764000,
    todayPosts: 205,
    fandom: "스텔라",
    tagline: "차갑고 단단한 컨셉의 정석",
    bio: "강렬한 컨셉과 칼군무로 사랑받는 5인조. 팬미팅 드레스코드 문화를 만든 팀으로도 알려져 있습니다.",
    tags: ["컨셉", "칼군무", "팬미팅"],
    chip: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    accent: "#4f46e5",
  },
  {
    key: "noon",
    name: "NOON",
    nameKo: "눈",
    image: "/img/artist-noon.svg",
    cover: "/img/hero-sunset.svg",
    type: "싱어송라이터",
    debut: "2018.03.05",
    agency: "Slowtape",
    members: ["눈"],
    followers: 286000,
    todayPosts: 61,
    fandom: "정오",
    tagline: "가사를 오래 읽게 만드는",
    bio: "직접 쓰고 부르는 싱어송라이터. 앨범마다 짧은 소설을 함께 발표하는 작업 방식으로 팬층이 두텁습니다.",
    tags: ["포크", "작사", "어쿠스틱"],
    chip: "bg-yellow-50 text-yellow-700 ring-yellow-100",
    accent: "#ca8a04",
  },
];

export const artistByKey = Object.fromEntries(
  artists.map((a) => [a.key, a]),
) as Record<ArtistKey, Artist>;

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export type HeroSlide = {
  id: string;
  eyebrow: string;
  titleTop: string;
  titleBottom: string;
  subtitle: string;
  cta: string;
  to: string;
  image: string;
  featuredLabel: string;
  featuredName: string;
};

export const heroSlides: HeroSlide[] = [
  {
    id: "vol08",
    eyebrow: "DELUXLA ORIGINAL · VOL. 08",
    titleTop: "밤을 닮은",
    titleBottom: "새로운 목소리",
    subtitle: "DELUXLA ORIGINAL · 아티스트 스토리",
    cta: "이야기 보러가기",
    to: "/artists/lumi",
    image: "/img/hero-stage.svg",
    featuredLabel: "FEATURED ARTIST",
    featuredName: "LUMI · 소야",
  },
  {
    id: "signal",
    eyebrow: "LIVE REPORT · SIGNAL TOUR",
    titleTop: "도쿄에서 시작된",
    titleBottom: "12개 도시의 밤",
    subtitle: "NOVA 월드투어 현장 리포트",
    cta: "투어 후기 보기",
    to: "/artists/nova",
    image: "/img/hero-neon.svg",
    featuredLabel: "FEATURED ARTIST",
    featuredName: "NOVA · 도윤",
  },
  {
    id: "summerwave",
    eyebrow: "FESTIVAL · SUMMER WAVE 2026",
    titleTop: "올여름 가장 뜨거운",
    titleBottom: "3일간의 라인업",
    subtitle: "8월 14일 티켓 오픈 · 팬룸 사전 응모 진행 중",
    cta: "라인업 확인하기",
    to: "/fanclub",
    image: "/img/hero-sunset.svg",
    featuredLabel: "HEADLINER",
    featuredName: "NOVA · LUMI · KIDO",
  },
  {
    id: "chart",
    eyebrow: "WEEKLY CHART · 08월 3주차",
    titleTop: "이번 주 차트를",
    titleBottom: "뒤집은 한 곡",
    subtitle: "SATELLITE, 발매 9일 만에 1위",
    cta: "차트 보러가기",
    to: "/chart",
    image: "/img/hero-arena.svg",
    featuredLabel: "NO.1 THIS WEEK",
    featuredName: "NOVA · SATELLITE",
  },
];

/* ------------------------------------------------------------------ */
/* Chart                                                               */
/* ------------------------------------------------------------------ */

export type ChartTrend = "up" | "down" | "same" | "new";

export type ChartEntry = {
  rank: number;
  title: string;
  artist: ArtistKey;
  album: string;
  cover: string;
  trend: ChartTrend;
  /** Rank movement since the last update. */
  change: number;
  peak: number;
  listeners: number;
  duration: string;
};

export const chart: ChartEntry[] = [
  {
    rank: 1,
    title: "SATELLITE",
    artist: "nova",
    album: "SIGNAL",
    cover: "/img/album-satellite.svg",
    trend: "up",
    change: 2,
    peak: 1,
    listeners: 482913,
    duration: "3:24",
  },
  {
    rank: 2,
    title: "Paper Moon",
    artist: "lumi",
    album: "Paper Moon",
    cover: "/img/album-paper-moon.svg",
    trend: "same",
    change: 0,
    peak: 1,
    listeners: 421077,
    duration: "3:51",
  },
  {
    rank: 3,
    title: "Blue Hour",
    artist: "mellow",
    album: "Blue Hour",
    cover: "/img/album-blue-hour.svg",
    trend: "up",
    change: 4,
    peak: 3,
    listeners: 318204,
    duration: "4:12",
  },
  {
    rank: 4,
    title: "SLIDE",
    artist: "kido",
    album: "SLIDE",
    cover: "/img/album-slide.svg",
    trend: "same",
    change: 0,
    peak: 2,
    listeners: 296451,
    duration: "2:58",
  },
  {
    rank: 5,
    title: "Afterglow",
    artist: "lumi",
    album: "Afterglow",
    cover: "/img/album-afterglow.svg",
    trend: "new",
    change: 0,
    peak: 5,
    listeners: 271330,
    duration: "3:37",
  },
  {
    rank: 6,
    title: "Midnight Drive",
    artist: "orbit",
    album: "First Orbit",
    cover: "/img/album-midnight.svg",
    trend: "up",
    change: 3,
    peak: 6,
    listeners: 244819,
    duration: "3:05",
  },
  {
    rank: 7,
    title: "Cherry Coke",
    artist: "velvet",
    album: "Two A.M.",
    cover: "/img/album-cherry.svg",
    trend: "down",
    change: 2,
    peak: 4,
    listeners: 208764,
    duration: "3:19",
  },
  {
    rank: 8,
    title: "ECHO",
    artist: "aster",
    album: "STELLA",
    cover: "/img/album-echo.svg",
    trend: "down",
    change: 1,
    peak: 2,
    listeners: 187502,
    duration: "3:02",
  },
  {
    rank: 9,
    title: "정오의 편지",
    artist: "noon",
    album: "정오",
    cover: "/img/album-paper-moon.svg",
    trend: "up",
    change: 5,
    peak: 9,
    listeners: 154903,
    duration: "4:41",
  },
  {
    rank: 10,
    title: "Runway",
    artist: "aster",
    album: "STELLA",
    cover: "/img/album-echo.svg",
    trend: "same",
    change: 0,
    peak: 7,
    listeners: 141288,
    duration: "3:11",
  },
];

/* ------------------------------------------------------------------ */
/* Community posts                                                     */
/* ------------------------------------------------------------------ */

export type PostCategory =
  "뮤직비디오" | "공연 후기" | "앨범 리뷰" | "굿즈" | "자유" | "질문";

export type Post = {
  id: string;
  artist: ArtistKey;
  category: PostCategory;
  title: string;
  excerpt: string;
  body: string[];
  author: string;
  authorTag: string;
  createdLabel: string;
  /** Minutes since posting — used for deterministic sorting only. */
  createdMinutes: number;
  likes: number;
  comments: number;
  views: number;
  talking: number;
  image?: string;
  hot?: boolean;
};

export const posts: Post[] = [
  {
    id: "afterglow-teaser",
    artist: "lumi",
    category: "뮤직비디오",
    title: "새 싱글 ‘Afterglow’ 티저 속 숨은 장면들",
    excerpt:
      "0:14에 지나가는 네온 간판, 2집 재킷이랑 같은 골목이에요. 프레임 단위로 뜯어봤습니다.",
    body: [
      "티저 공개되자마자 스무 번은 돌려본 것 같아요. 0:14에 지나가는 네온 간판, 저 골목 2집 재킷 촬영지랑 같은 곳입니다.",
      "그리고 0:32의 회전 숏, 카메라가 도는 방향이 데뷔 앨범 인트로 뮤비랑 정확히 반대예요. 세계관 이어진다는 얘기가 괜히 나온 게 아닌 듯.",
      "마지막 3초 검은 화면에서 소리만 남는 부분, 헤드폰으로 들으면 멀리서 관객 함성이 깔려 있습니다. 이번 앨범 콘서트 실황 소스 쓴 것 같아요.",
    ],
    author: "야광봉관리자",
    authorTag: "루미너스",
    createdLabel: "12분 전",
    createdMinutes: 12,
    likes: 3241,
    comments: 482,
    views: 18422,
    talking: 1284,
    image: "/img/feed-lightstick.svg",
    hot: true,
  },
  {
    id: "tokyo-band-set",
    artist: "nova",
    category: "공연 후기",
    title: "도쿄 앙코르 무대의 라이브 밴드 편곡",
    excerpt:
      "3일차 앙코르에서 SATELLITE를 밴드 편곡으로 했는데, 브릿지 키를 반음 올렸어요.",
    body: [
      "3일차 앙코르 세트리스트가 완전히 달랐습니다. SATELLITE를 밴드 편곡으로 돌렸는데 브릿지에서 키를 반음 올렸어요.",
      "도윤 파트 애드리브가 원곡보다 길었고, 관객 떼창 구간을 일부러 비워두더라고요. 현장에서 소름이 돋았습니다.",
      "공연장 밖에서 팬들이 다 같이 다시 부른 것도 좋았어요. 다음 서울 공연도 밴드 편곡 유지했으면.",
    ],
    author: "온에어",
    authorTag: "노바디",
    createdLabel: "38분 전",
    createdMinutes: 38,
    likes: 2118,
    comments: 219,
    views: 12903,
    talking: 987,
    hot: true,
  },
  {
    id: "blue-hour-lp",
    artist: "mellow",
    category: "앨범 리뷰",
    title: "‘Blue Hour’ LP 패키지, 무엇을 골라야 할까?",
    excerpt:
      "일반반과 한정반 차이 정리했습니다. 결론부터 말하면 한정반은 사운드가 다릅니다.",
    body: [
      "일반반과 한정반 둘 다 받아서 비교했습니다. 결론부터 말하면 마스터링이 다릅니다.",
      "한정반은 아날로그 마스터를 따로 떠서 저음이 훨씬 두껍습니다. 대신 고음 쪽이 살짝 뭉개져요. 취향 문제입니다.",
      "패키지는 한정반 완승. 가사집 종이 질감이 다르고 멤버 손글씨 인서트가 들어 있습니다.",
    ],
    author: "턴테이블",
    authorTag: "멜로",
    createdLabel: "1시간 전",
    createdMinutes: 62,
    likes: 1804,
    comments: 143,
    views: 9820,
    talking: 764,
    hot: true,
  },
  {
    id: "tour-first-day",
    artist: "nova",
    category: "공연 후기",
    title: "투어의 첫날, 우리가 함께 부른 마지막 후렴",
    excerpt:
      "“오늘은 정말 오래 기억하게 될 것 같아요.” 현장의 온도를 담은 짧은 기록을 남깁니다.",
    body: [
      "“오늘은 정말 오래 기억하게 될 것 같아요.” 마지막 곡 전에 도윤이 한 말입니다.",
      "조명이 다 꺼지고 야광봉만 남았을 때, 2만 명이 한 번에 같은 후렴을 불렀어요. 무대에서도 한참 말을 못 잇더라고요.",
      "공연 끝나고 나오는 길에 다들 목이 쉬어서 웃기만 했습니다. 다음 도시에서 또 만나요.",
    ],
    author: "새벽세시",
    authorTag: "노바디",
    createdLabel: "2시간 전",
    createdMinutes: 121,
    likes: 942,
    comments: 87,
    views: 6410,
    talking: 421,
    image: "/img/feed-crowd.svg",
  },
  {
    id: "tracklist-order",
    artist: "mellow",
    category: "앨범 리뷰",
    title: "이번 앨범의 트랙 순서가 완벽한 이유",
    excerpt:
      "1번과 마지막 트랙의 코드 진행이 같습니다. 앨범 전체가 하나의 루프예요.",
    body: [
      "1번 트랙과 마지막 트랙의 코드 진행이 완전히 같습니다. 앨범을 반복 재생하면 이어지도록 설계된 거예요.",
      "가운데 4~6번은 일부러 템포를 떨어뜨려서 공연 세트리스트의 흐름을 그대로 옮겨 놨습니다.",
      "이런 구성은 스트리밍 시대에 쉽지 않은 선택이라 더 반가웠어요.",
    ],
    author: "민트초코",
    authorTag: "멜로",
    createdLabel: "18분 전",
    createdMinutes: 18,
    likes: 128,
    comments: 12,
    views: 1840,
    talking: 96,
  },
  {
    id: "fanmeeting-dresscode",
    artist: "lumi",
    category: "굿즈",
    title: "팬미팅 드레스코드 색 조합 공유해요!",
    excerpt:
      "이번 팬미팅 컨셉이 ‘새벽’이라 라벤더 + 실버 조합으로 맞춰가려고 합니다.",
    body: [
      "이번 팬미팅 컨셉이 ‘새벽’이라 라벤더 + 실버 조합으로 맞춰가려고 합니다.",
      "작년처럼 좌석 구역별로 색을 나누면 무대에서 봤을 때 그라데이션이 예쁘게 나올 것 같아요.",
      "구역별 색 정리한 이미지 곧 올릴게요. 의견 주세요!",
    ],
    author: "라벤더",
    authorTag: "루미너스",
    createdLabel: "24분 전",
    createdMinutes: 24,
    likes: 214,
    comments: 33,
    views: 2410,
    talking: 158,
  },
  {
    id: "slide-challenge",
    artist: "kido",
    category: "자유",
    title: "SLIDE 챌린지, 결국 부모님까지 추셨습니다",
    excerpt:
      "가족 단톡방에 올렸더니 아버지가 회사 워크샵에서 추셨다고 합니다. 이게 맞나요?",
    body: [
      "가족 단톡방에 챌린지 영상을 올렸더니 아버지가 회사 워크샵에서 추셨다고 합니다.",
      "안무가 쉬워서 그런지 정말 세대를 안 가리네요. 키도 본인도 이걸 예상했을까요?",
      "다음 챌린지는 좀 더 어려운 걸로 부탁드립니다(진심).",
    ],
    author: "슬라이드",
    authorTag: "키즈",
    createdLabel: "3시간 전",
    createdMinutes: 184,
    likes: 673,
    comments: 91,
    views: 5120,
    talking: 302,
  },
  {
    id: "orbit-first-concert",
    artist: "orbit",
    category: "공연 후기",
    title: "데뷔 2년, 첫 단독 콘서트 후기 (스포 주의)",
    excerpt: "리허설 영상 공개부터 마지막 인사까지, 3시간이 순식간이었습니다.",
    body: [
      "오프닝이 리허설 영상이었어요. 연습실에서 넘어지고 다시 서는 장면부터 시작합니다.",
      "중반 유닛 무대에서 각자 곡을 직접 골랐다고 하는데, 하루의 어쿠스틱 편곡이 제일 좋았습니다.",
      "앙코르에서 멤버 전원이 객석으로 내려왔고, 마지막 인사는 다들 울면서 했습니다.",
    ],
    author: "궤도이탈",
    authorTag: "오르빗터",
    createdLabel: "4시간 전",
    createdMinutes: 243,
    likes: 511,
    comments: 64,
    views: 4302,
    talking: 264,
    image: "/img/feed-stage.svg",
  },
  {
    id: "velvet-ost",
    artist: "velvet",
    category: "자유",
    title: "드라마 OST 목록 정리했습니다 (2019~2026)",
    excerpt: "총 21곡, 작사 참여 여부까지 표로 만들었어요.",
    body: [
      "총 21곡입니다. 작사 참여 여부까지 표로 정리했어요.",
      "의외로 2021년에만 6곡을 했습니다. 그 해 목소리 톤이 확실히 다릅니다.",
      "빠진 곡 있으면 댓글로 알려주세요. 계속 업데이트하겠습니다.",
    ],
    author: "문라이터",
    authorTag: "문라이터",
    createdLabel: "6시간 전",
    createdMinutes: 372,
    likes: 388,
    comments: 47,
    views: 3211,
    talking: 187,
  },
  {
    id: "backstage-photo",
    artist: "aster",
    category: "자유",
    title: "백스테이지 비하인드 사진 모음",
    excerpt: "공식 계정에 올라온 비하인드컷, 화질 좋은 순서대로 모아뒀습니다.",
    body: [
      "공식 계정 비하인드컷을 화질 좋은 순서대로 모았습니다.",
      "리허설 사진에서 인이어 색이 멤버별로 다른 거 눈치채신 분?",
      "저장은 자유지만 2차 편집은 출처 남겨주세요.",
    ],
    author: "스텔라기록",
    authorTag: "스텔라",
    createdLabel: "8시간 전",
    createdMinutes: 496,
    likes: 806,
    comments: 58,
    views: 7220,
    talking: 341,
    image: "/img/feed-backstage.svg",
  },
  {
    id: "noon-lyrics",
    artist: "noon",
    category: "앨범 리뷰",
    title: "‘정오의 편지’ 가사를 소설과 함께 읽어봤어요",
    excerpt: "동봉된 단편을 먼저 읽고 들으면 2절이 완전히 다르게 들립니다.",
    body: [
      "앨범에 동봉된 단편을 먼저 읽고 들었습니다. 2절이 완전히 다르게 들려요.",
      "화자가 편지를 쓰는 사람이 아니라 받는 사람이라는 걸 알고 나면 마지막 문장이 뒤집힙니다.",
      "이런 방식의 발매, 계속해줬으면 좋겠습니다.",
    ],
    author: "정오독자",
    authorTag: "정오",
    createdLabel: "10시간 전",
    createdMinutes: 610,
    likes: 297,
    comments: 39,
    views: 2680,
    talking: 149,
  },
  {
    id: "ticket-tips",
    artist: "nova",
    category: "질문",
    title: "티켓팅 처음인데 준비물이 뭐가 있을까요?",
    excerpt: "예매처 회원가입 말고 미리 해두면 좋은 것들 알려주세요.",
    body: [
      "이번 서울 공연이 첫 티켓팅입니다. 예매처 가입 말고 미리 해두면 좋은 것 있을까요?",
      "결제 수단은 미리 등록해뒀고, 좌석 배치도도 봐뒀습니다.",
      "선예매 코드가 팬룸 인증이랑 연동된다고 들었는데 맞나요?",
    ],
    author: "첫티켓",
    authorTag: "노바디",
    createdLabel: "12시간 전",
    createdMinutes: 742,
    likes: 132,
    comments: 76,
    views: 4810,
    talking: 118,
  },
  {
    id: "lumi-photocard",
    artist: "lumi",
    category: "굿즈",
    title: "포토카드 실물 비교 (일반반 vs 위버스반)",
    excerpt: "인쇄 질감이 꽤 다릅니다. 스캔본 첨부합니다.",
    body: [
      "두 버전 인쇄 질감이 꽤 다릅니다. 위버스반이 광택이 더 강해요.",
      "색감은 일반반이 원본에 가깝습니다. 스캔본 첨부합니다.",
      "교환은 팬룸 거래 게시판을 이용해주세요.",
    ],
    author: "카드지기",
    authorTag: "루미너스",
    createdLabel: "14시간 전",
    createdMinutes: 880,
    likes: 452,
    comments: 61,
    views: 5390,
    talking: 226,
  },
  {
    id: "mellow-busking",
    artist: "mellow",
    category: "공연 후기",
    title: "홍대 버스킹 깜짝 등장, 30분 기록",
    excerpt: "예고 없이 나타나서 네 곡 하고 사라졌습니다. 셋리스트 정리합니다.",
    body: [
      "예고 없이 나타나서 네 곡 하고 사라졌습니다. 셋리스트 정리합니다.",
      "1. Blue Hour 2. 오래된 방 3. 미발표 신곡 4. 첫 EP 타이틀",
      "3번 신곡이 정말 좋았어요. 음원으로 꼭 내주셨으면.",
    ],
    author: "홍대주민",
    authorTag: "멜로",
    createdLabel: "1일 전",
    createdMinutes: 1580,
    likes: 733,
    comments: 95,
    views: 8120,
    talking: 388,
  },
];

export const postById = Object.fromEntries(
  posts.map((p) => [p.id, p]),
) as Record<string, Post>;

export function postsByArtist(key: ArtistKey) {
  return posts.filter((p) => p.artist === key);
}

/** The three headline rows of the "지금 뜨거운 이야기" panel. */
export const trendingPosts = posts.filter((p) => p.hot).slice(0, 3);

export type Comment = {
  id: string;
  author: string;
  authorTag: string;
  createdLabel: string;
  body: string;
  likes: number;
};

export const commentsByPost: Record<string, Comment[]> = {
  "afterglow-teaser": [
    {
      id: "c1",
      author: "네온사인",
      authorTag: "루미너스",
      createdLabel: "8분 전",
      body: "0:14 골목 진짜네요. 2집 재킷 뒷면이랑 간판 글씨까지 똑같습니다.",
      likes: 312,
    },
    {
      id: "c2",
      author: "새벽라디오",
      authorTag: "루미너스",
      createdLabel: "6분 전",
      body: "마지막 3초 함성 소스, 작년 서울 콘서트 앙코르 같아요. 파형 비교해볼게요.",
      likes: 208,
    },
    {
      id: "c3",
      author: "달빛",
      authorTag: "멜로",
      createdLabel: "3분 전",
      body: "타팬인데 이런 분석글 보러 팬룸 옵니다. 잘 봤어요!",
      likes: 97,
    },
  ],
};

export const defaultComments: Comment[] = [
  {
    id: "d1",
    author: "무명팬",
    authorTag: "게스트",
    createdLabel: "방금 전",
    body: "좋은 글 감사합니다. 저장해두고 다시 읽을게요.",
    likes: 24,
  },
  {
    id: "d2",
    author: "야근중",
    authorTag: "노바디",
    createdLabel: "10분 전",
    body: "이거 보고 바로 스트리밍 돌리는 중입니다.",
    likes: 11,
  },
];

/* ------------------------------------------------------------------ */
/* Fan rooms, playlists, schedule                                      */
/* ------------------------------------------------------------------ */

export type FanRoom = {
  id: string;
  name: string;
  artist: ArtistKey;
  cover: string;
  description: string;
  members: number;
  onlineNow: number;
  tags: string[];
  live?: boolean;
};

export const fanRooms: FanRoom[] = [
  {
    id: "luminous-night",
    name: "루미너스 야간자율",
    artist: "lumi",
    cover: "/img/room-blush.svg",
    description:
      "새벽까지 티저 뜯어보는 방. 컴백 주간에는 실시간 감상회를 엽니다.",
    members: 48210,
    onlineNow: 1284,
    tags: ["컴백", "감상회", "24시간"],
    live: true,
  },
  {
    id: "nova-tour-desk",
    name: "노바 투어 상황실",
    artist: "nova",
    cover: "/img/room-violet.svg",
    description: "도시별 세트리스트, 좌석 시야, 굿즈 줄 현황을 함께 공유해요.",
    members: 62904,
    onlineNow: 2140,
    tags: ["투어", "티켓팅", "정보"],
    live: true,
  },
  {
    id: "mellow-lp-club",
    name: "멜로우 LP 클럽",
    artist: "mellow",
    cover: "/img/room-forest.svg",
    description: "LP 개봉기와 턴테이블 세팅을 나누는 느린 방.",
    members: 18422,
    onlineNow: 312,
    tags: ["LP", "장비", "리뷰"],
  },
  {
    id: "kido-challenge",
    name: "키도 챌린지 연습실",
    artist: "kido",
    cover: "/img/room-amber.svg",
    description: "거울모드 영상과 카운트 정리. 초보 환영합니다.",
    members: 25610,
    onlineNow: 705,
    tags: ["챌린지", "안무", "초보"],
  },
  {
    id: "orbit-rookie",
    name: "오르빗 첫 궤도",
    artist: "orbit",
    cover: "/img/room-dawn.svg",
    description: "데뷔부터 지금까지 기록을 모으는 아카이브 방.",
    members: 14208,
    onlineNow: 488,
    tags: ["아카이브", "신인", "기록"],
  },
  {
    id: "velvet-2am",
    name: "벨벳문 새벽 두 시",
    artist: "velvet",
    cover: "/img/room-neon.svg",
    description: "OST와 소극장 공연 이야기를 조용히 나누는 방.",
    members: 9820,
    onlineNow: 176,
    tags: ["OST", "소극장", "감상"],
  },
];

export type Playlist = {
  id: string;
  title: string;
  subtitle: string;
  tracks: number;
  minutes: number;
  cover: string;
};

export const playlists: Playlist[] = [
  {
    id: "summer-night",
    title: "나만의 여름 플레이리스트",
    subtitle: "오늘의 취향을 꺼내보세요.",
    tracks: 18,
    minutes: 64,
    cover: "/img/album-afterglow.svg",
  },
  {
    id: "first-room",
    title: "우리의 첫 번째 플레이리스트",
    subtitle: "팬룸 멤버들이 함께 채운 이번 주 목록",
    tracks: 24,
    minutes: 88,
    cover: "/img/card-room.svg",
  },
];

export type ScheduleItem = {
  id: string;
  date: string;
  weekday: string;
  title: string;
  artist: ArtistKey;
  type: "컴백" | "콘서트" | "팬미팅" | "티켓팅" | "방송";
  place: string;
};

export const schedule: ScheduleItem[] = [
  {
    id: "s1",
    date: "08.22",
    weekday: "금",
    title: "LUMI ‘Afterglow’ 발매",
    artist: "lumi",
    type: "컴백",
    place: "전 음원사이트 18:00",
  },
  {
    id: "s2",
    date: "08.24",
    weekday: "일",
    title: "NOVA SIGNAL TOUR 서울",
    artist: "nova",
    type: "콘서트",
    place: "올림픽홀 19:00",
  },
  {
    id: "s3",
    date: "08.27",
    weekday: "수",
    title: "SUMMER WAVE 2026 티켓 오픈",
    artist: "kido",
    type: "티켓팅",
    place: "선예매 20:00",
  },
  {
    id: "s4",
    date: "08.30",
    weekday: "토",
    title: "MELLOW 단독 공연 ‘느린 밤’",
    artist: "mellow",
    type: "콘서트",
    place: "웨스트브릿지 18:30",
  },
  {
    id: "s5",
    date: "09.02",
    weekday: "화",
    title: "ORBIT 데뷔 2주년 팬미팅",
    artist: "orbit",
    type: "팬미팅",
    place: "블루스퀘어 19:00",
  },
];

/** Chip rail above the community feed. */
export const feedFilters = [
  { key: "all", label: "전체" },
  ...artists.map((a) => ({ key: a.key, label: a.name })),
] as const;

export const postCategories: PostCategory[] = [
  "뮤직비디오",
  "공연 후기",
  "앨범 리뷰",
  "굿즈",
  "자유",
  "질문",
];
