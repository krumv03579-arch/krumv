# deluxla

한국어로는 **딜렉스타**, 표기·호스팅·서비스 이름은 **deluxla**로 씁니다. 한국어 문장
안에서는 딜렉스타, 로고와 제목과 도메인처럼 이름 자체가 들어가는 자리에는 deluxla입니다.

K-POP 팬 커뮤니티 웹앱. 좋아하는 아티스트의 소식, 팬들이 쓴 이야기, 실시간 뮤직차트를
한 화면에서 볼 수 있는 서비스입니다.

로그인, 글, 댓글, 좋아요·저장은 **Supabase**에 저장됩니다. 아티스트 프로필,
뮤직차트, 일정, 팬룸은 아직 `src/lib/mock-data.ts`의 가상 데이터입니다.

## 화면

| 경로                 | 설명                                                                              |
| -------------------- | --------------------------------------------------------------------------------- |
| `/`                  | 홈 — 히어로 캐러셀, 지금 뜨거운 이야기, 커뮤니티 피드, 실시간 차트, 다가오는 일정 |
| `/feed`              | 커뮤니티 피드 — 아티스트·말머리 필터, 최신/인기/화제순 정렬, 글쓰기               |
| `/feed/$postId`      | 글 상세 — 본문, 좋아요·저장·공유, 댓글 작성                                       |
| `/artists`           | 아티스트 목록 — 그룹/솔로 필터, 오늘 가장 활발한 아티스트                         |
| `/artists/$artistId` | 아티스트 홈 — 프로필, 팬 이야기 / 디스코그래피 / 소개 탭, 팔로우                  |
| `/chart`             | 뮤직차트 — 실시간·일간·주간, TOP3 카드와 전체 순위                                |
| `/fanclub`           | 팬클럽 — 팬룸 목록과 입장, 룸 랭킹·전용 일정                                      |
| `/login`             | 로그인 — 아이디/비밀번호 저장, 브라우저 계정으로 로그인                           |
| `/signup`            | 회원가입 — 이메일·비밀번호·닉네임 3개 항목                                        |

`⌘/Ctrl + K`로 어디서든 통합 검색을 열 수 있습니다.

## 계정

Supabase Auth(이메일 + 비밀번호)를 사용합니다 (`src/lib/auth.ts`).

- 가입: 이메일, 비밀번호(6자 이상), 닉네임. 닉네임은 계정 메타데이터에 저장되고
  DB 트리거가 `public.profiles.display_name`으로 복사합니다.
- Supabase 프로젝트에서 이메일 인증(Confirm email)이 켜져 있으면 가입 직후에는
  로그인되지 않고, 안내와 함께 로그인 화면으로 이동합니다. 바로 로그인되게 하려면
  Authentication → Providers → Email에서 confirm email을 꺼주세요.
- 로그인: `아이디 저장` / `비밀번호 저장` 체크 시 다음 방문에 입력값이 채워집니다.
  이 두 값만 이 브라우저에 남습니다(`deluxla:remember:v1`).
- 로그인 상태에서 글쓰기·댓글에 닉네임이 작성자로 표시됩니다.
- 헤더 우측 프로필(아바타 + 닉네임)을 누르면 마이페이지로 이동합니다.

## 백엔드 (Supabase)

연결 정보는 `src/integrations/supabase/config.ts`에 들어 있어 클론 직후 바로
동작합니다. 다른 프로젝트를 쓰려면 `.env`에 `VITE_SUPABASE_URL`,
`VITE_SUPABASE_PUBLISHABLE_KEY`를 넣으면 이 값이 우선합니다 (`.env.example` 참고).
게시 가능 키(publishable key)는 브라우저용이라 번들에 포함되며, 실제 방어선은
RLS 정책입니다. 서비스 롤 키는 저장소에 두지 않습니다.

### 스키마 적용

`supabase/migrations/20260821093000_deluxla_backend.sql`을 Supabase 대시보드의
SQL Editor에 붙여넣고 실행하면 됩니다 (`supabase db push`도 동일). 여러 번 실행해도
안전하게 작성돼 있습니다.

| 테이블            | 내용                                                      |
| ----------------- | --------------------------------------------------------- |
| `profiles`        | 계정별 닉네임. 가입 시 트리거가 자동 생성                 |
| `pulse_posts`     | 커뮤니티 글 (아티스트, 말머리, 본문, 좋아요/댓글/조회 수) |
| `pulse_comments`  | 댓글                                                      |
| `pulse_reactions` | 좋아요와 저장 (`kind` 컬럼으로 구분)                      |

- 테이블 이름에 `pulse_` 접두사를 쓰는 이유는, 이 저장소의 마이그레이션 기록에
  이전 Lovable 프로젝트의 `posts`/`comments`/`products` 스키마가 남아 있기 때문입니다.
- 모든 테이블에 RLS가 켜져 있습니다. 읽기는 누구나, 쓰기는 본인 행만 가능합니다.
- 좋아요/댓글 수는 트리거가 `pulse_posts`에 갱신합니다.
- `pulse_comments.post_id`와 `pulse_reactions.post_id`가 `text`인 이유는, 피드가
  DB 글(uuid)과 번들에 포함된 시드 글(슬러그)을 함께 보여주기 때문입니다.

## 활동 기록

작성한 글, 댓글, 좋아요, 저장은 계정에 묶여 Supabase에 저장되므로 브라우저를
바꿔도 그대로 남습니다. 마이페이지의 네 개 탭이 이 기록을 보여줍니다.

데이터 접근은 모두 `src/lib/api.ts`에 모여 있고, `src/components/activity-provider.tsx`가
피드와 내 활동을 들고 있습니다. DB를 읽지 못하면 피드는 시드 데이터로 내려앉고
안내 문구를 함께 보여줍니다.

## 기술 스택

- TanStack Start (파일 기반 라우팅) + React 19
- Supabase (Auth + Postgres, RLS)
- Tailwind CSS v4 (디자인 토큰은 `src/styles.css`)
- shadcn/ui 기반 컴포넌트 (`src/components/ui`)
- lucide-react 아이콘, sonner 토스트

## 이미지

외부 이미지 호스트에 의존하지 않도록 모든 아트워크를 SVG로 직접 생성해
`public/img/`에 두었습니다. 무대 조명·관객 실루엣의 공연 이미지, 앨범 커버,
아티스트 포트레이트, 팬룸 커버가 포함됩니다.

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

## 다음 단계

- 아티스트·팬룸·일정을 DB로 옮기고 팔로우·팬룸 가입 연결
- 차트 집계 파이프라인
- 이미지 업로드(Supabase Storage)와 실제 아티스트 콘텐츠 연결
