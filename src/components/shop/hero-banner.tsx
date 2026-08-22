import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

/**
 * Decorative scene for the hero — parcels in transit over a rounded globe.
 * Drawn inline so the banner ships without artwork files.
 */
function DeliveryScene() {
  return (
    <svg viewBox="0 0 900 340" className="w-full" aria-hidden="true">
      <defs>
        <linearGradient id="dx-globe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c3f2d2" />
          <stop offset="1" stopColor="#8fe3ad" />
        </linearGradient>
        <linearGradient id="dx-box" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dbe4ff" />
        </linearGradient>
      </defs>

      {/* clouds */}
      <g fill="#ffffff" opacity="0.3">
        <ellipse cx="120" cy="66" rx="78" ry="26" />
        <ellipse cx="700" cy="44" rx="62" ry="21" />
        <ellipse cx="520" cy="112" rx="44" ry="16" />
      </g>

      {/* ground */}
      <path d="M0 250c190-56 710-56 900 0v90H0v-90Z" fill="url(#dx-globe)" />
      <path
        d="M80 252c150-32 590-32 740 0"
        fill="none"
        stroke="#ffffff"
        strokeWidth="7"
        strokeLinecap="round"
        opacity="0.65"
      />

      {/* delivery route pins */}
      <g fill="#ff6b81">
        <path d="M182 236c0-10 8-18 18-18s18 8 18 18-18 30-18 30-18-20-18-30Z" />
        <circle cx="200" cy="236" r="6" fill="#fff" />
        <path d="M432 228c0-10 8-18 18-18s18 8 18 18-18 30-18 30-18-20-18-30Z" />
        <circle cx="450" cy="228" r="6" fill="#fff" />
        <path d="M690 238c0-10 8-18 18-18s18 8 18 18-18 30-18 30-18-20-18-30Z" />
        <circle cx="708" cy="238" r="6" fill="#fff" />
      </g>

      {/* parcels in transit */}
      <g>
        <rect
          x="330"
          y="118"
          width="96"
          height="80"
          rx="14"
          fill="url(#dx-box)"
        />
        <path d="M378 118v80" stroke="#a9b8ff" strokeWidth="7" />
        <path d="M330 152h96" stroke="#a9b8ff" strokeWidth="7" />
        <rect
          x="556"
          y="150"
          width="70"
          height="60"
          rx="12"
          fill="url(#dx-box)"
        />
        <path d="M591 150v60" stroke="#a9b8ff" strokeWidth="6" />
        <rect
          x="196"
          y="150"
          width="58"
          height="50"
          rx="11"
          fill="url(#dx-box)"
          opacity="0.9"
        />
        <path d="M225 150v50" stroke="#a9b8ff" strokeWidth="5" />
      </g>

      {/* plane */}
      <g transform="translate(660 74) rotate(-14)" fill="#ffffff">
        <path d="M0 18 84 4l22 14-22 14L0 18Z" />
        <path d="M30 18 12-12h13l32 24-27 6Z" opacity="0.85" />
      </g>

      {/* sparkles */}
      <g fill="#ffffff" opacity="0.9">
        <path d="M116 156c2 7 4.4 9.4 11.4 11.4-7 2-9.4 4.4-11.4 11.4-2-7-4.4-9.4-11.4-11.4 7-2 9.4-4.4 11.4-11.4Z" />
        <path d="M792 170c1.5 5 3 6.6 8 8-5 1.5-6.6 3-8 8-1.5-5-3-6.6-8-8 5-1.4 6.6-3 8-8Z" />
        <path d="M486 60c1.2 4 2.4 5.2 6.4 6.4-4 1.2-5.2 2.4-6.4 6.4-1.2-4-2.4-5.2-6.4-6.4 4-1.2 5.2-2.4 6.4-6.4Z" />
      </g>
    </svg>
  );
}

export function HeroBanner() {
  return (
    <section className="relative flex min-h-[420px] flex-col overflow-hidden rounded-2xl bg-primary p-8 text-primary-foreground sm:p-10 lg:min-h-[560px]">
      <h1 className="max-w-[440px] text-[30px] font-extrabold leading-[1.32] tracking-[-0.02em] sm:text-[38px]">
        결제와 구매부터
        <br />
        배송까지 –<br />한 곳에서 해결하세요
      </h1>

      <Link
        to="/service"
        className="mt-8 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/95 px-6 py-3 text-[15px] font-bold text-primary transition-colors hover:bg-white"
      >
        이용 방법
        <ChevronRight className="h-4 w-4" />
      </Link>

      <div className="pointer-events-none mt-auto -mx-8 -mb-8 flex w-[calc(100%+4rem)] items-end sm:-mx-10 sm:-mb-10 sm:w-[calc(100%+5rem)]">
        <DeliveryScene />
      </div>
    </section>
  );
}
