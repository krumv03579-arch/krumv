# deluxta

한국 쇼핑몰을 대신 주문·결제하고, 웨어하우스에 모아 두었다가 합배송으로 보내는
해외 역직구(구매대행) 서비스의 프론트엔드입니다. 화면 구성과 라우트는
`README.md`를 보세요.

## 작업 후 반드시 할 것: 배포 링크 알려주기

이 저장소는 Vercel GitHub 연동이 붙어 있어, 푸시하면 사람이 아무것도 하지 않아도
자동으로 배포됩니다. **코드를 푸시했으면 응답에 그 결과를 확인해서 알려주세요.**

1. 푸시 후 Vercel 배포가 끝났는지 확인합니다.
   `mcp__github__pull_request_read`의 `get_status`로 해당 PR의 상태를 보면
   `context: "Vercel"`, `description: "Deployment has completed"`가 뜹니다.
   (아직 빌드 중이면 `pending`입니다.)
2. 그 브랜치의 프리뷰 URL을 응답 끝에 붙입니다. URL은 PR에 달린 `vercel[bot]`
   코멘트의 Preview 링크에 있습니다. 형식은
   `https://krumv-git-<브랜치명을 하이픈으로>-krumv03579-6885s-projects.vercel.app`
   이고, 브랜치마다 고정이라 커밋을 새로 푸시해도 주소는 그대로입니다.
3. 배포가 실패했으면 링크 대신 실패 사실과 원인을 먼저 알립니다.

프로덕션은 `https://krumv.vercel.app`이며, PR이 프로덕션 브랜치
(저장소 기본 브랜치)로 병합될 때 갱신됩니다.

## 빌드

- 패키지 매니저는 bun입니다. `bun install`, `bun run dev`, `bun run build`,
  `bun run lint`.
- 빌드는 nitro를 거칩니다. Vercel(`VERCEL=1`)에서는 `.vercel/output`,
  그 외에는 `.output`을 만듭니다 (`node .output/server/index.mjs`로 실행).
- 이 저장소는 예전에 Lovable 스캐폴드에서 시작했지만 그 의존성은 모두
  걷어냈습니다. `@lovable.dev/*` 패키지나 사설 레지스트리를 다시 들이지 마세요.

## 데이터와 이미지

- 백엔드가 없습니다. 상품·스토어는 `src/lib/shop-data.ts`의 목 데이터이고,
  계정은 localStorage에 저장됩니다 (`src/lib/auth.ts`).
- 상품 이미지는 `public/img/*.svg`를 자리표시용으로 재사용 중입니다. 스토어
  로고와 히어로 일러스트는 컴포넌트 안 인라인 SVG입니다.
- 푸터의 회사 정보(대표, 주소, 사업자번호, 통신판매업신고번호, 특허고객번호)는
  실제 등록 정보입니다. 임의로 바꾸지 마세요. 고객센터 이메일·전화번호는 아직
  정해지지 않아 비워 두었습니다.
