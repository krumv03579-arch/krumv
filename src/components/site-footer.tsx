import { Link } from "@tanstack/react-router";

const COMPANY = {
  name: "Deluxta Inc.",
  ceo: "Lee Kyoung Joo",
  privacyOfficer: "Jung Jin Woo",
  address: "2F, 238 Bucheon-ro, Wonmi-gu, Bucheon, Gyeonggi-do, Korea",
  businessNumber: "117-81-91297",
  mailOrderNumber: "2021-경기부천-1226",
  phone: "+82-1544-3936",
  email: "support@deluxta.com",
} as const;

const GUIDE_LINKS = [
  { label: "즉시 결제", to: "/service" },
  { label: "수동 구매", to: "/service" },
  { label: "웨어하우스", to: "/warehouse" },
] as const;

const POLICY_LINKS = [
  { label: "개인정보처리방침", to: "/support" },
  { label: "이용약관", to: "/support" },
  { label: "취소 / 반품 정책", to: "/support" },
] as const;

/** Social glyphs are inline so the footer needs no icon assets. */
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle
        cx="12"
        cy="12"
        r="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M3 3h4.4l4.7 6.3L17.8 3H21l-7.3 8.3L21.4 21H17l-5-6.7L6.1 21H3l7.7-8.8L3 3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M14 3h2.6c.3 2 1.5 3.4 3.6 3.7v2.7c-1.4.05-2.7-.35-3.9-1.15v5.9c0 3.4-2.4 5.85-5.6 5.85S5 17.55 5 14.2c0-3.1 2.2-5.5 5.4-5.5.35 0 .7.03 1 .08v2.9a3 3 0 0 0-1-.18c-1.5 0-2.6 1.1-2.6 2.7 0 1.6 1.1 2.75 2.7 2.75 1.6 0 2.6-1.1 2.6-2.9V3Z"
        fill="currentColor"
      />
    </svg>
  );
}

const SOCIALS = [
  { label: "Instagram", Icon: InstagramIcon },
  { label: "X", Icon: XIcon },
  { label: "TikTok", Icon: TikTokIcon },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-secondary/70">
      <div className="mx-auto max-w-[1460px] px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:gap-16">
          <div>
            <p className="text-[22px] font-extrabold tracking-[-0.02em]">
              {COMPANY.name}
            </p>

            <dl className="mt-6 grid gap-y-5 text-[13px] sm:grid-cols-[auto_auto] sm:gap-x-10">
              <div>
                <dt className="font-bold text-foreground">대표이사</dt>
                <dd className="mt-1 text-muted-foreground">{COMPANY.ceo}</dd>
              </div>
              <div>
                <dt className="font-bold text-foreground">
                  개인정보보호책임자
                </dt>
                <dd className="mt-1 text-muted-foreground">
                  {COMPANY.privacyOfficer}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-bold text-foreground">회사 주소</dt>
                <dd className="mt-1 text-muted-foreground">
                  {COMPANY.address}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-foreground">사업자등록번호</dt>
                <dd className="mt-1 text-muted-foreground">
                  {COMPANY.businessNumber}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-foreground">
                  통신판매업신고번호
                </dt>
                <dd className="mt-1 text-muted-foreground">
                  {COMPANY.mailOrderNumber}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <p className="text-[15px] font-extrabold">가이드</p>
            <ul className="mt-5 space-y-3">
              {GUIDE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link to="/support" className="text-[15px] font-extrabold">
                  블로그
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[15px] font-extrabold">고객센터 운영시간</p>
            <p className="mt-5 max-w-[220px] text-[13px] leading-relaxed text-muted-foreground">
              10:00 AM ~ 6:00 PM (KST),
              <br />
              공휴일 제외
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-border/70 pt-8">
          <div className="flex items-center gap-5 text-foreground">
            {SOCIALS.map(({ label, Icon }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="transition-opacity hover:opacity-60"
              >
                <Icon />
              </a>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[12.5px] text-muted-foreground">
            <span className="font-semibold text-foreground/80">
              © 2026 {COMPANY.name} All Rights Reserved.
            </span>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {POLICY_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-x-6 gap-y-2">
              <a
                href={`tel:${COMPANY.phone}`}
                className="hover:text-foreground"
              >
                {COMPANY.phone}
              </a>
              <a
                href={`mailto:${COMPANY.email}`}
                className="hover:text-foreground"
              >
                {COMPANY.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
