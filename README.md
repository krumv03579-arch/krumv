# pulseroom

K-POP 팬 커뮤니티 웹앱. 좋아하는 아티스트의 소식, 팬들이 쓴 이야기, 실시간 뮤직차트를
한 화면에서 볼 수 있는 서비스입니다.

현재는 **프론트엔드 단계**입니다. 모든 화면은 `src/lib/mock-data.ts`의 가상 데이터로
동작하며, 백엔드(로그인·글 저장·차트 집계)는 아직 연결되어 있지 않습니다.

## 화면

| 경로 | 설명 |
| --- | --- |
| `/` | 홈 — 히어로 캐러셀, 지금 뜨거운 이야기, 커뮤니티 피드, 실시간 차트, 다가오는 일정 |
| `/feed` | 커뮤니티 피드 — 아티스트·말머리 필터, 최신/인기/화제순 정렬, 글쓰기 |
| `/feed/$postId` | 글 상세 — 본문, 좋아요·저장·공유, 댓글 작성 |
| `/artists` | 아티스트 목록 — 그룹/솔로 필터, 오늘 가장 활발한 아티스트 |
| `/artists/$artistId` | 아티스트 홈 — 프로필, 팬 이야기 / 디스코그래피 / 소개 탭, 팔로우 |
| `/chart` | 뮤직차트 — 실시간·일간·주간, TOP3 카드와 전체 순위 |
| `/fanclub` | 팬클럽 — 팬룸 목록과 입장, 룸 랭킹·전용 일정 |
| `/login` | 로그인 화면 (UI만 구현) |

`⌘/Ctrl + K`로 어디서든 통합 검색을 열 수 있습니다.

## 기술 스택

- TanStack Start (파일 기반 라우팅) + React 19
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

- Supabase 연동(인증, 게시글/댓글 저장, 팔로우·팬룸 가입)
- 차트 집계 파이프라인
- 이미지 업로드와 실제 아티스트 콘텐츠 연결
