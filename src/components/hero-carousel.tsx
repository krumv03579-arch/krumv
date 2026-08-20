import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { heroSlides } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 6000;

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = heroSlides.length;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (next: number) => setIndex(((next % total) + total) % total),
    [total],
  );

  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(
      () => setIndex((prev) => (prev + 1) % total),
      AUTOPLAY_MS,
    );
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, total]);

  return (
    <section
      className="group relative h-[340px] overflow-hidden rounded-3xl bg-[#0b0a1f] sm:h-[380px] lg:h-[420px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="pulseroom 주요 소식"
    >
      {heroSlides.map((slide, i) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-out",
            i === index ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          aria-hidden={i !== index}
        >
          <img
            src={slide.image}
            alt=""
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-transform duration-[8000ms] ease-out",
              i === index ? "scale-105" : "scale-100",
            )}
            loading={i === 0 ? "eager" : "lazy"}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#08071a]/95 via-[#08071a]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08071a]/80 via-transparent to-transparent" />

          <div className="relative flex h-full flex-col justify-center px-6 sm:px-10 lg:px-14">
            <p className="eyebrow text-white/60">{slide.eyebrow}</p>
            <h1 className="mt-4 text-[34px] font-black leading-[1.12] tracking-[-0.03em] text-white sm:text-[44px] lg:text-[52px]">
              {slide.titleTop}
              <br />
              <span className="text-[#a9c6ff]">{slide.titleBottom}</span>
            </h1>
            <p className="mt-4 text-[13px] font-medium text-white/70 sm:text-sm">
              {slide.subtitle}
            </p>
            <div className="mt-7">
              <Link
                to={slide.to}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#0b0a1f] shadow-lg transition-transform hover:-translate-y-0.5"
              >
                {slide.cta}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-4 text-right lg:flex">
            <div>
              <p className="eyebrow text-white/45">{slide.featuredLabel}</p>
              <p className="mt-1.5 text-sm font-bold tracking-[0.12em] text-white/85">
                {slide.featuredName}
              </p>
            </div>
            <span className="h-14 w-px bg-white/25" />
            <p className="text-xs font-bold tracking-[0.18em] text-white/70">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(total).padStart(2, "0")}
            </p>
          </div>
        </div>
      ))}

      <button
        type="button"
        aria-label="이전 슬라이드"
        onClick={() => goTo(index - 1)}
        className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white opacity-0 backdrop-blur transition hover:bg-white/20 focus-visible:opacity-100 group-hover:opacity-100"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="다음 슬라이드"
        onClick={() => goTo(index + 1)}
        className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white opacity-0 backdrop-blur transition hover:bg-white/20 focus-visible:opacity-100 group-hover:opacity-100 lg:right-3"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-6 right-8 flex items-center gap-2">
        {heroSlides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`${i + 1}번 슬라이드로 이동`}
            aria-current={i === index}
            onClick={() => goTo(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index
                ? "w-8 bg-white"
                : "w-1.5 bg-white/45 hover:bg-white/70",
            )}
          />
        ))}
      </div>
    </section>
  );
}
