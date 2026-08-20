/**
 * Generates the K-pop themed artwork used across pulseroom.
 *
 * Everything ships as SVG in `public/img/` so the app never depends on an
 * external image host: stage/concert scenes for the hero + feed, abstract
 * album covers for the chart, and gradient portraits for artists.
 *
 *   node scripts/generate-art.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "img",
);
mkdirSync(OUT, { recursive: true });

/** Deterministic PRNG so regenerating the art never reshuffles the layout. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const r2 = (n) => Math.round(n * 100) / 100;

function grain(id, opacity = 0.28, freq = 0.9) {
  return {
    def: `<filter id="${id}"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="7"/><feColorMatrix type="saturate" values="0"/></filter>`,
    use: (w, h) =>
      `<rect width="${w}" height="${h}" filter="url(#${id})" opacity="${opacity}" style="mix-blend-mode:overlay"/>`,
  };
}

/** Light beams fanning down from the rig, the signature look of a stage shot. */
function beams(seed, w, h, colors, count = 7) {
  const rand = rng(seed);
  let defs = "";
  let body = "";
  for (let i = 0; i < count; i++) {
    const id = `beam-${seed}-${i}`;
    const originX = r2(
      w * (0.08 + (0.84 * i) / Math.max(1, count - 1)) + (rand() - 0.5) * 60,
    );
    const spread = r2(w * (0.06 + rand() * 0.1));
    const drift = r2((rand() - 0.5) * w * 0.35);
    const bottom = r2(h * (0.72 + rand() * 0.4));
    const color = colors[i % colors.length];
    defs += `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity="0.75"/><stop offset="0.55" stop-color="${color}" stop-opacity="0.22"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient>`;
    body += `<path d="M${originX} ${r2(-h * 0.04)} L${r2(originX + drift + spread)} ${bottom} L${r2(originX + drift - spread)} ${bottom} Z" fill="url(#${id})" style="mix-blend-mode:screen"/>`;
  }
  return { defs, body };
}

/** Bokeh / stage-haze specks. */
function bokeh(seed, w, h, count = 42, color = "#ffffff") {
  const rand = rng(seed);
  let body = "";
  for (let i = 0; i < count; i++) {
    const cx = r2(rand() * w);
    const cy = r2(rand() * h * 0.85);
    const rr = r2(1 + rand() * 5);
    const op = r2(0.12 + rand() * 0.5);
    body += `<circle cx="${cx}" cy="${cy}" r="${rr}" fill="${color}" opacity="${op}"/>`;
  }
  return body;
}

/** Audience silhouette: heads, shoulders and a forest of raised lightsticks. */
function crowd(
  seed,
  w,
  h,
  { baseY, color = "#05060f", sticks = true, scale = 1 } = {},
) {
  const rand = rng(seed);
  let body = `<path d="M0 ${r2(baseY + 40 * scale)} Q ${r2(w * 0.25)} ${r2(baseY + 6 * scale)} ${r2(w * 0.5)} ${r2(baseY + 26 * scale)} T ${w} ${r2(baseY + 14 * scale)} L ${w} ${h} L 0 ${h} Z" fill="${color}"/>`;
  if (sticks) {
    for (let i = 0; i < Math.round(w / 30); i++) {
      const x = r2(rand() * w);
      const top = r2(baseY - (4 + rand() * 58) * scale);
      const glow = ["#ffd8ec", "#cfe0ff", "#ffe9b8", "#e4d4ff"][
        Math.floor(rand() * 4)
      ];
      const armTop = r2(top + 20 * scale);
      body += `<path d="M${x} ${r2(baseY + 30 * scale)} L${x} ${armTop}" stroke="${color}" stroke-width="${r2(5 * scale)}" stroke-linecap="round"/>`;
      body += `<circle cx="${x}" cy="${top}" r="${r2(5.5 * scale)}" fill="${glow}" opacity="${r2(0.55 + rand() * 0.45)}"/>`;
      body += `<circle cx="${x}" cy="${top}" r="${r2(13 * scale)}" fill="${glow}" opacity="0.16" style="mix-blend-mode:screen"/>`;
    }
  }
  for (let i = 0; i < Math.round(w / 21); i++) {
    const x = r2(rand() * w);
    const cy = r2(baseY + (14 + rand() * 46) * scale);
    const rr = r2((16 + rand() * 11) * scale);
    body += `<circle cx="${x}" cy="${cy}" r="${rr}" fill="${color}"/>`;
    body += `<ellipse cx="${x}" cy="${r2(cy + rr * 1.7)}" rx="${r2(rr * 1.7)}" ry="${r2(rr * 1.5)}" fill="${color}"/>`;
  }
  return body;
}

function svg(w, h, defs, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img"><defs>${defs}</defs>${body}</svg>\n`;
}

function write(name, content) {
  writeFileSync(join(OUT, name), content);
  return name;
}

/* ------------------------------------------------------------------ */
/* Hero — wide stage scenes                                            */
/* ------------------------------------------------------------------ */

const heroes = [
  {
    file: "hero-stage.svg",
    seed: 11,
    sky: ["#120b2e", "#2a1360", "#6c2a86"],
    beamColors: ["#ff7ad9", "#7aa2ff", "#ffd166", "#b388ff"],
    glow: "#ff8ad4",
  },
  {
    file: "hero-neon.svg",
    seed: 29,
    sky: ["#04121f", "#0b3350", "#12718f"],
    beamColors: ["#5ee7ff", "#5b8cff", "#c2f5ff", "#8affd7"],
    glow: "#5ee7ff",
  },
  {
    file: "hero-sunset.svg",
    seed: 47,
    sky: ["#2b0b26", "#7c1f4d", "#e0655f"],
    beamColors: ["#ffb36b", "#ff7a9c", "#ffe0a3", "#ff5f8f"],
    glow: "#ffb36b",
  },
  {
    file: "hero-arena.svg",
    seed: 83,
    sky: ["#0a0a1c", "#1b1b47", "#3b2a7a"],
    beamColors: ["#a5b4ff", "#ffffff", "#8ee9ff", "#d6b4ff"],
    glow: "#a5b4ff",
  },
];

for (const hero of heroes) {
  const W = 1600;
  const H = 560;
  const g = grain(`hg-${hero.seed}`, 0.22);
  const b = beams(hero.seed, W, H, hero.beamColors, 8);
  const defs = `
    <linearGradient id="sky-${hero.seed}" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="${hero.sky[0]}"/>
      <stop offset="0.55" stop-color="${hero.sky[1]}"/>
      <stop offset="1" stop-color="${hero.sky[2]}"/>
    </linearGradient>
    <radialGradient id="glow-${hero.seed}" cx="0.5" cy="0.86" r="0.62">
      <stop offset="0" stop-color="${hero.glow}" stop-opacity="0.85"/>
      <stop offset="1" stop-color="${hero.glow}" stop-opacity="0"/>
    </radialGradient>
    ${b.defs}${g.def}`;
  const body = `
    <rect width="${W}" height="${H}" fill="url(#sky-${hero.seed})"/>
    ${b.body}
    ${bokeh(hero.seed + 5, W, H, 60)}
    <ellipse cx="${W / 2}" cy="${H * 0.9}" rx="${W * 0.44}" ry="${H * 0.3}" fill="url(#glow-${hero.seed})" style="mix-blend-mode:screen"/>
    ${crowd(hero.seed + 9, W, H, { baseY: H * 0.78, scale: 1.05 })}
    ${g.use(W, H)}`;
  write(hero.file, svg(W, H, defs, body));
}

/* ------------------------------------------------------------------ */
/* Feature cards — festival poster, fan room, feed photos              */
/* ------------------------------------------------------------------ */

{
  const W = 640;
  const H = 800;
  const g = grain("fest", 0.2);
  const b = beams(101, W, H, ["#ff9ecb", "#8ab6ff", "#ffe28a"], 5);
  const defs = `
    <linearGradient id="fest-sky" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="#0f1030"/><stop offset="0.5" stop-color="#3d1a6b"/><stop offset="1" stop-color="#c2418b"/>
    </linearGradient>
    <radialGradient id="fest-glow" cx="0.5" cy="0.72" r="0.6">
      <stop offset="0" stop-color="#ffd6a5" stop-opacity="0.8"/><stop offset="1" stop-color="#ffd6a5" stop-opacity="0"/>
    </radialGradient>
    ${b.defs}${g.def}`;
  const body = `
    <rect width="${W}" height="${H}" fill="url(#fest-sky)"/>
    ${b.body}
    ${bokeh(102, W, H, 46)}
    <ellipse cx="${W / 2}" cy="${H * 0.74}" rx="${W * 0.62}" ry="${H * 0.24}" fill="url(#fest-glow)" style="mix-blend-mode:screen"/>
    <path d="M${W * 0.12} ${H * 0.66} L${W * 0.5} ${H * 0.5} L${W * 0.88} ${H * 0.66} L${W * 0.88} ${H * 0.72} L${W * 0.12} ${H * 0.72} Z" fill="#0b0a1f" opacity="0.65"/>
    ${crowd(103, W, H, { baseY: H * 0.7, scale: 0.9 })}
    ${g.use(W, H)}`;
  write("card-festival.svg", svg(W, H, defs, body));
}

{
  const W = 720;
  const H = 460;
  const g = grain("room", 0.16);
  const defs = `
    <linearGradient id="room-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#141a4a"/><stop offset="0.55" stop-color="#2c2f8f"/><stop offset="1" stop-color="#6f4ce0"/>
    </linearGradient>
    <radialGradient id="room-orb" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#a3b8ff" stop-opacity="0.9"/><stop offset="1" stop-color="#a3b8ff" stop-opacity="0"/>
    </radialGradient>
    ${g.def}`;
  let waves = "";
  for (let i = 0; i < 5; i++) {
    const y = H * 0.42 + i * 26;
    waves += `<path d="M-40 ${r2(y)} Q ${r2(W * 0.25)} ${r2(y - 46 + i * 8)} ${r2(W * 0.5)} ${r2(y)} T ${W + 40} ${r2(y - 12)}" stroke="#cdd8ff" stroke-opacity="${r2(0.34 - i * 0.05)}" stroke-width="2" fill="none"/>`;
  }
  let bars = "";
  const rand = rng(404);
  for (let i = 0; i < 26; i++) {
    const bh = r2(18 + rand() * 120);
    bars += `<rect x="${r2(W * 0.08 + i * 22)}" y="${r2(H * 0.82 - bh)}" width="8" height="${bh}" rx="4" fill="#dbe3ff" opacity="${r2(0.25 + rand() * 0.5)}"/>`;
  }
  const body = `
    <rect width="${W}" height="${H}" fill="url(#room-bg)"/>
    <circle cx="${W * 0.82}" cy="${H * 0.3}" r="${H * 0.42}" fill="url(#room-orb)" style="mix-blend-mode:screen"/>
    ${waves}${bars}
    ${bokeh(405, W, H, 26, "#e7ecff")}
    ${g.use(W, H)}`;
  write("card-room.svg", svg(W, H, defs, body));
}

const feedScenes = [
  {
    file: "feed-crowd.svg",
    seed: 201,
    sky: ["#160b2c", "#4a1550", "#ef6f6c"],
    colors: ["#ffb4a2", "#ffd6a5", "#ff8fab"],
  },
  {
    file: "feed-stage.svg",
    seed: 233,
    sky: ["#061225", "#123a63", "#2f8fb0"],
    colors: ["#8ce9ff", "#7aa2ff", "#d6f6ff"],
  },
  {
    file: "feed-lightstick.svg",
    seed: 277,
    sky: ["#0d0722", "#331a63", "#7a3ea8"],
    colors: ["#e0b3ff", "#9bb6ff", "#ffd1f0"],
  },
  {
    file: "feed-backstage.svg",
    seed: 311,
    sky: ["#1a1005", "#4a2a10", "#c98b3f"],
    colors: ["#ffd9a0", "#ffb877", "#fff0d0"],
  },
];

for (const scene of feedScenes) {
  const W = 960;
  const H = 640;
  const g = grain(`fs-${scene.seed}`, 0.22);
  const b = beams(scene.seed, W, H, scene.colors, 6);
  const defs = `
    <linearGradient id="fsky-${scene.seed}" x1="0.1" y1="0" x2="0.7" y2="1">
      <stop offset="0" stop-color="${scene.sky[0]}"/><stop offset="0.55" stop-color="${scene.sky[1]}"/><stop offset="1" stop-color="${scene.sky[2]}"/>
    </linearGradient>
    ${b.defs}${g.def}`;
  const body = `
    <rect width="${W}" height="${H}" fill="url(#fsky-${scene.seed})"/>
    ${b.body}
    ${bokeh(scene.seed + 3, W, H, 40)}
    ${crowd(scene.seed + 7, W, H, { baseY: H * 0.72, scale: 0.95 })}
    ${g.use(W, H)}`;
  write(scene.file, svg(W, H, defs, body));
}

/* ------------------------------------------------------------------ */
/* Album covers — abstract sleeves for the chart + release cards       */
/* ------------------------------------------------------------------ */

const albums = [
  {
    file: "album-satellite.svg",
    seed: 501,
    from: "#3b1d8f",
    to: "#ff5f9e",
    ink: "#ffe3f4",
    motif: "orbit",
  },
  {
    file: "album-paper-moon.svg",
    seed: 517,
    from: "#0d2a4a",
    to: "#7ad3ff",
    ink: "#eaf8ff",
    motif: "moon",
  },
  {
    file: "album-blue-hour.svg",
    seed: 541,
    from: "#101a5c",
    to: "#2fd6c4",
    ink: "#e6fff9",
    motif: "wave",
  },
  {
    file: "album-slide.svg",
    seed: 563,
    from: "#5a1d0a",
    to: "#ffc46b",
    ink: "#fff3dc",
    motif: "stripes",
  },
  {
    file: "album-afterglow.svg",
    seed: 587,
    from: "#4a0b3d",
    to: "#ff9b6a",
    ink: "#ffeede",
    motif: "sun",
  },
  {
    file: "album-midnight.svg",
    seed: 613,
    from: "#07102e",
    to: "#6b5bff",
    ink: "#e7e9ff",
    motif: "grid",
  },
  {
    file: "album-cherry.svg",
    seed: 641,
    from: "#5c0b34",
    to: "#ff9ec4",
    ink: "#fff0f6",
    motif: "orbit",
  },
  {
    file: "album-echo.svg",
    seed: 673,
    from: "#0b3b2e",
    to: "#9ef0a5",
    ink: "#effff2",
    motif: "wave",
  },
];

for (const album of albums) {
  const S = 480;
  const g = grain(`al-${album.seed}`, 0.24, 1.1);
  const rand = rng(album.seed);
  let motif = "";
  if (album.motif === "orbit") {
    for (let i = 0; i < 4; i++) {
      motif += `<ellipse cx="${S / 2}" cy="${S / 2}" rx="${r2(S * (0.2 + i * 0.09))}" ry="${r2(S * (0.34 - i * 0.03))}" fill="none" stroke="${album.ink}" stroke-opacity="${r2(0.5 - i * 0.09)}" stroke-width="${r2(2 + i)}" transform="rotate(${r2(-24 + i * 16)} ${S / 2} ${S / 2})"/>`;
    }
    motif += `<circle cx="${S / 2}" cy="${S / 2}" r="${S * 0.11}" fill="${album.ink}" opacity="0.92"/>`;
  } else if (album.motif === "moon") {
    motif += `<circle cx="${S * 0.58}" cy="${S * 0.42}" r="${S * 0.26}" fill="${album.ink}" opacity="0.94"/>`;
    motif += `<circle cx="${S * 0.46}" cy="${S * 0.36}" r="${S * 0.24}" fill="${album.from}" opacity="0.96"/>`;
    for (let i = 0; i < 18; i++) {
      motif += `<circle cx="${r2(rand() * S)}" cy="${r2(rand() * S)}" r="${r2(1 + rand() * 2.6)}" fill="${album.ink}" opacity="${r2(0.3 + rand() * 0.6)}"/>`;
    }
  } else if (album.motif === "wave") {
    for (let i = 0; i < 9; i++) {
      const y = S * 0.28 + i * 22;
      motif += `<path d="M-20 ${r2(y)} Q ${r2(S * 0.28)} ${r2(y - 54 + i * 5)} ${r2(S * 0.55)} ${r2(y)} T ${S + 20} ${r2(y - 18)}" fill="none" stroke="${album.ink}" stroke-opacity="${r2(0.45 - i * 0.035)}" stroke-width="3"/>`;
    }
  } else if (album.motif === "stripes") {
    for (let i = 0; i < 8; i++) {
      motif += `<rect x="${r2(S * 0.1 + i * 42)}" y="${r2(S * 0.14 + (i % 3) * 26)}" width="20" height="${r2(S * 0.6 - (i % 3) * 40)}" rx="10" fill="${album.ink}" opacity="${r2(0.28 + (i % 4) * 0.16)}"/>`;
    }
  } else if (album.motif === "sun") {
    motif += `<circle cx="${S / 2}" cy="${S * 0.52}" r="${S * 0.24}" fill="${album.ink}" opacity="0.9"/>`;
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2;
      const x1 = S / 2 + Math.cos(a) * S * 0.3;
      const y1 = S * 0.52 + Math.sin(a) * S * 0.3;
      const x2 = S / 2 + Math.cos(a) * S * 0.44;
      const y2 = S * 0.52 + Math.sin(a) * S * 0.44;
      motif += `<path d="M${r2(x1)} ${r2(y1)} L${r2(x2)} ${r2(y2)}" stroke="${album.ink}" stroke-opacity="0.55" stroke-width="5" stroke-linecap="round"/>`;
    }
  } else {
    for (let i = 0; i <= 8; i++) {
      motif += `<path d="M0 ${r2((S / 8) * i)} L${S} ${r2((S / 8) * i)}" stroke="${album.ink}" stroke-opacity="0.22" stroke-width="2"/>`;
      motif += `<path d="M${r2((S / 8) * i)} 0 L${r2((S / 8) * i)} ${S}" stroke="${album.ink}" stroke-opacity="0.22" stroke-width="2"/>`;
    }
    motif += `<circle cx="${S * 0.62}" cy="${S * 0.38}" r="${S * 0.16}" fill="${album.ink}" opacity="0.85"/>`;
  }
  const defs = `
    <linearGradient id="alg-${album.seed}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${album.from}"/><stop offset="1" stop-color="${album.to}"/>
    </linearGradient>
    <radialGradient id="alv-${album.seed}" cx="0.5" cy="0.4" r="0.75">
      <stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.34"/>
    </radialGradient>
    ${g.def}`;
  const body = `
    <rect width="${S}" height="${S}" fill="url(#alg-${album.seed})"/>
    ${motif}
    <rect width="${S}" height="${S}" fill="url(#alv-${album.seed})"/>
    ${g.use(S, S)}`;
  write(album.file, svg(S, S, defs, body));
}

/* ------------------------------------------------------------------ */
/* Artist portraits — gradient + silhouette bust                       */
/* ------------------------------------------------------------------ */

const artists = [
  { file: "artist-lumi.svg", seed: 701, from: "#ff8ac0", to: "#7b3fe4" },
  { file: "artist-nova.svg", seed: 719, from: "#7b6cff", to: "#22d3ee" },
  { file: "artist-mellow.svg", seed: 733, from: "#2fd6a0", to: "#0f766e" },
  { file: "artist-kido.svg", seed: 757, from: "#ffb95e", to: "#e2513c" },
  { file: "artist-orbit.svg", seed: 787, from: "#60a5fa", to: "#1e3a8a" },
  { file: "artist-velvet.svg", seed: 811, from: "#f472b6", to: "#7c2d63" },
  { file: "artist-aster.svg", seed: 829, from: "#c084fc", to: "#4338ca" },
  { file: "artist-noon.svg", seed: 853, from: "#fcd34d", to: "#b45309" },
];

for (const artist of artists) {
  const S = 480;
  const g = grain(`ar-${artist.seed}`, 0.2, 1.2);
  const rand = rng(artist.seed);
  let sparks = "";
  for (let i = 0; i < 16; i++) {
    sparks += `<circle cx="${r2(rand() * S)}" cy="${r2(rand() * S * 0.8)}" r="${r2(1.5 + rand() * 3.5)}" fill="#fff" opacity="${r2(0.18 + rand() * 0.4)}"/>`;
  }
  const defs = `
    <linearGradient id="arg-${artist.seed}" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0" stop-color="${artist.from}"/><stop offset="1" stop-color="${artist.to}"/>
    </linearGradient>
    <linearGradient id="ars-${artist.seed}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0b0a1a" stop-opacity="0.82"/><stop offset="1" stop-color="#0b0a1a" stop-opacity="0.96"/>
    </linearGradient>
    ${g.def}`;
  const body = `
    <rect width="${S}" height="${S}" fill="url(#arg-${artist.seed})"/>
    <circle cx="${S * 0.5}" cy="${S * 0.42}" r="${S * 0.3}" fill="#fff" opacity="0.13"/>
    ${sparks}
    <g fill="url(#ars-${artist.seed})">
      <circle cx="${S * 0.5}" cy="${S * 0.42}" r="${S * 0.17}"/>
      <path d="M${S * 0.5} ${S * 0.6} c ${S * 0.17} 0 ${S * 0.28} ${S * 0.12} ${S * 0.3} ${S * 0.4} L${S * 0.2} ${S} c 0.02 -${S * 0.28} ${S * 0.13} -${S * 0.4} ${S * 0.3} -${S * 0.4} Z"/>
    </g>
    ${g.use(S, S)}`;
  write(artist.file, svg(S, S, defs, body));
}

/* ------------------------------------------------------------------ */
/* Fan-club room covers                                                */
/* ------------------------------------------------------------------ */

const rooms = [
  { file: "room-neon.svg", seed: 901, from: "#ff5f9e", to: "#3b1d8f" },
  { file: "room-dawn.svg", seed: 907, from: "#60a5fa", to: "#0f172a" },
  { file: "room-forest.svg", seed: 911, from: "#34d399", to: "#065f46" },
  { file: "room-amber.svg", seed: 919, from: "#fbbf24", to: "#7c2d12" },
  { file: "room-violet.svg", seed: 929, from: "#a78bfa", to: "#312e81" },
  { file: "room-blush.svg", seed: 937, from: "#fb7185", to: "#831843" },
];

for (const room of rooms) {
  const W = 640;
  const H = 400;
  const g = grain(`rm-${room.seed}`, 0.18);
  const rand = rng(room.seed);
  let rings = "";
  for (let i = 0; i < 5; i++) {
    rings += `<circle cx="${r2(W * (0.15 + rand() * 0.75))}" cy="${r2(H * (0.2 + rand() * 0.6))}" r="${r2(40 + rand() * 120)}" fill="none" stroke="#fff" stroke-opacity="${r2(0.1 + rand() * 0.18)}" stroke-width="${r2(1 + rand() * 3)}"/>`;
  }
  const defs = `
    <linearGradient id="rmg-${room.seed}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${room.from}"/><stop offset="1" stop-color="${room.to}"/>
    </linearGradient>${g.def}`;
  const body = `
    <rect width="${W}" height="${H}" fill="url(#rmg-${room.seed})"/>
    ${rings}${bokeh(room.seed + 1, W, H, 24)}
    ${g.use(W, H)}`;
  write(room.file, svg(W, H, defs, body));
}

/* ------------------------------------------------------------------ */
/* Brand mark + favicon                                                */
/* ------------------------------------------------------------------ */

const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><defs><linearGradient id="m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff6f91"/><stop offset="0.55" stop-color="#ff4d6d"/><stop offset="1" stop-color="#7c4dff"/></linearGradient></defs><rect width="64" height="64" rx="18" fill="url(#m)"/><path d="M32 13.5c1.4 6.6 4.4 9.6 11 11-6.6 1.4-9.6 4.4-11 11-1.4-6.6-4.4-9.6-11-11 6.6-1.4 9.6-4.4 11-11Z" fill="#fff"/><path d="M20.5 38.5c.8 3.6 2.4 5.2 6 6-3.6.8-5.2 2.4-6 6-.8-3.6-2.4-5.2-6-6 3.6-.8 5.2-2.4 6-6Z" fill="#fff" opacity="0.85"/></svg>\n`;
write("brand-mark.svg", mark);
writeFileSync(join(OUT, "..", "favicon.svg"), mark);

console.log(`generated art in ${OUT}`);
