import { Link } from "@tanstack/react-router";

import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import {
  LEGAL,
  LEGAL_DOCUMENTS,
  type LegalBlock,
  type LegalSection,
} from "@/lib/legal";
import { cn } from "@/lib/utils";

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === "string") {
    return (
      <p className="text-[14.5px] leading-[1.85] text-foreground/85">{block}</p>
    );
  }

  if ("list" in block) {
    const Tag = block.ordered ? "ol" : "ul";
    return (
      <Tag
        className={cn(
          "space-y-2 pl-5 text-[14.5px] leading-[1.85] text-foreground/85",
          block.ordered ? "list-decimal" : "list-disc",
        )}
      >
        {block.list.map((item, index) => (
          <li key={index} className="pl-1">
            {item}
          </li>
        ))}
      </Tag>
    );
  }

  return (
    // Narrow screens scroll the table rather than the page.
    <div className="overflow-x-auto rounded-xl border border-border/70">
      <table className="w-full min-w-[520px] border-collapse text-left text-[13.5px]">
        <thead>
          <tr className="bg-secondary/60">
            {block.table.head.map((cell) => (
              <th
                key={cell}
                className="px-4 py-3 font-bold text-foreground/90"
                scope="col"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.table.rows.map((row, index) => (
            <tr key={index} className="border-t border-border/70">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-4 py-3 align-top leading-relaxed text-foreground/85"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Shared shell for 이용약관 / 개인정보처리방침 / 커뮤니티 가이드. */
export function LegalDocument({
  eyebrow,
  title,
  description,
  current,
  sections,
  closing,
}: {
  eyebrow: string;
  title: string;
  description: string;
  /** Path of the document being shown, so its own tab reads as selected. */
  current: string;
  sections: LegalSection[];
  /** Optional line under the last section, such as a 부칙. */
  closing?: string;
}) {
  return (
    <main className="mx-auto w-full max-w-[860px] px-4 pb-4 pt-8 sm:px-6">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <nav
        aria-label="약관 문서"
        className="mt-6 flex flex-wrap gap-2 border-b border-border/70 pb-5"
      >
        {LEGAL_DOCUMENTS.map((doc) => (
          <Link
            key={doc.to}
            to={doc.to}
            aria-current={doc.to === current ? "page" : undefined}
            className={cn(
              "rounded-full px-4 py-2 text-[13px] font-bold transition-colors",
              doc.to === current
                ? "bg-foreground text-background"
                : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            {doc.label}
          </Link>
        ))}
      </nav>

      <Panel className="mt-6 p-6 sm:p-9">
        <div className="space-y-9">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-[17px] font-extrabold tracking-[-0.02em]">
                {section.heading}
              </h2>
              <div className="mt-3 space-y-3">
                {section.blocks.map((block, index) => (
                  <Block key={index} block={block} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-10 border-t border-border/70 pt-5 text-[13px] text-muted-foreground">
          {closing ?? `이 문서는 ${LEGAL.effective}부터 적용됩니다.`}
        </p>
      </Panel>
    </main>
  );
}
