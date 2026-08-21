/**
 * Details the three legal documents share.
 *
 * These values are printed on public pages, so they have to be the real ones
 * before the service opens. `contactEmail` is a reserved example address and
 * `processorRegion` is blank on purpose — neither is a guess at something the
 * operator has not told us.
 */
export const LEGAL = {
  /** The service name as it reads inside a Korean sentence. */
  service: "딜렉스타",
  /** Effective date shown at the foot of every document. */
  effective: "2026년 8월 21일",
  /** TODO: replace with the address the operator actually reads. */
  contactEmail: "help@deluxla.example",
  /** TODO: name the person accountable for personal data. */
  privacyOfficer: "딜렉스타 운영팀",
  /** Who stores the data on the operator's behalf. */
  processor: "Supabase, Inc.",
  /**
   * The country the database sits in — Supabase 대시보드 → Project Settings →
   * General → Region. Left blank until confirmed; the page words the section
   * differently rather than naming the wrong country.
   */
  processorRegion: "",
} as const;

/** A paragraph, a list, or a small table. */
export type LegalBlock =
  | string
  | { list: string[]; ordered?: boolean }
  | { table: { head: string[]; rows: string[][] } };

export type LegalSection = {
  heading: string;
  blocks: LegalBlock[];
};

export const LEGAL_DOCUMENTS = [
  { to: "/terms", label: "이용약관" },
  { to: "/privacy", label: "개인정보처리방침" },
  { to: "/guidelines", label: "커뮤니티 가이드" },
] as const;
