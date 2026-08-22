# deluxta (딜렉스타)

한국 쇼핑몰을 대신 주문·결제하고, 웨어하우스에 모아 두었다가 합배송으로 보내는
**해외 역직구(구매대행) 서비스**의 프론트엔드입니다.

현재는 **프론트엔드 단계**입니다. 모든 화면은 `src/lib/shop-data.ts`의 가상 데이터로
동작하며, 백엔드(주문·결제·배송 추적)는 아직 연결되어 있지 않습니다.

## 화면

| 경로         | 설명                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| `/`          | 홈 — 스토어 바로가기, 이벤트, 히어로 배너, 서비스 카드, 스토어별 상품 열 |
| `/store`     | 스토어 — 스토어 탭 전환과 상품 그리드 (`?store=` 검색 파라미터)          |
| `/service`   | 서비스 — 즉시 결제 / 수동 구매 흐름과 수수료                             |
| `/warehouse` | 웨어하우스 — 1년 무료 보관, 합배송, 국가별 배송비 표                     |
| `/support`   | 고객지원 — 자주 묻는 질문과 문의 채널                                    |
| `/login`     | 로그인 — 아이디/비밀번호 저장, 브라우저 계정으로 로그인                  |
| `/signup`    | 회원가입 — 이메일·비밀번호·닉네임 3개 항목                               |
| `/me`        | 마이페이지 — 계정 활동 기록                                              |

취급 스토어는 Olive Young, Bunjang, FANS SHOP, Ktown4u, yes24입니다
(`src/lib/shop-data.ts`).

> K-POP 커뮤니티 시절의 화면(`/feed`, `/artists`, `/chart`, `/fanclub`)은 아직 파일이
> 남아 있지만 어디에서도 링크하지 않습니다. 다음 정리 단계에서 제거할 예정입니다.

## 계정

백엔드가 없는 단계라 계정은 브라우저(localStorage)에 저장됩니다 (`src/lib/auth.ts`).

- 가입: 이메일, 비밀번호(6자 이상), 닉네임만 입력하면 바로 로그인됩니다.
- 로그인: `아이디 저장` / `비밀번호 저장` 체크 시 다음 방문에 입력값이 채워집니다.
- 계정 비밀번호는 솔트를 붙인 SHA-256 해시로 저장합니다. 실제 비밀번호는 쓰지 마세요.

Supabase를 붙일 때는 `src/components/auth-provider.tsx`의 `signIn`/`signUp`/`signOut`
구현만 교체하면 화면 쪽 코드는 그대로 사용할 수 있습니다.

## 기술 스택

- TanStack Start (파일 기반 라우팅) + React 19
- Tailwind CSS v4 (디자인 토큰은 `src/styles.css`)
- shadcn/ui 기반 컴포넌트 (`src/components/ui`)
- lucide-react 아이콘, sonner 토스트

## 이미지

외부 이미지 호스트에 의존하지 않도록 상품·배너 아트워크는 SVG로 직접 생성해
`public/img/`에 두었습니다. 현재 상품 이미지는 자리표시용이며, 스토어 로고와 히어로
일러스트는 컴포넌트 안에 인라인 SVG로 그려져 있습니다.

```bash
node scripts/generate-art.mjs   # public/img/*.svg 다시 생성
```

## 개발

```bash
bun install
bun run dev      # 개발 서버
bun run build    # 프로덕션 빌드
bun run lint     # eslint + prettier
```

## 배포

`vite.config.ts`가 nitro를 통해 두 가지 산출물을 만듭니다.

- **Vercel** — 빌드 환경의 `VERCEL=1`을 보고 `vercel` 프리셋으로 전환해
  `.vercel/output/`(Build Output API)을 생성합니다. Vercel 프로젝트에서 별도
  설정 없이 `bun run build`만 실행하면 됩니다.
- **그 외** — 기본 프리셋으로 `.output/`을 만듭니다. `node .output/server/index.mjs`
  로 실행하고 `PORT`로 포트를 지정합니다.

## 다음 단계

- 스토어 상품 크롤링/연동과 실제 상품 이미지
- 주문서·견적·결제 플로우와 백엔드 연동
- 웨어하우스 입고 검수 사진, 합배송 신청, 배송 추적
