import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Compass,
  Package as PackageIcon,
  BookMarked,
  Files,
  GraduationCap,
  PackageCheck,
  FlaskConical,
  ListChecks,
  Database,
  Image as ImageIcon,
  FileText,
  Paperclip,
  Lightbulb,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { ConceptChip } from "./ConceptChip";
import {
  prereqKindLabel,
  leafById,
  colorForLeaf,
  type PrereqKind,
} from "../data/docTree";

const PREREQ_STYLE: Record<PrereqKind, { Icon: LucideIcon; color: string }> = {
  doc: { Icon: FileText, color: "var(--p3)" },
  data: { Icon: Database, color: "var(--p1)" },
  photo: { Icon: ImageIcon, color: "var(--p4)" },
  test: { Icon: FlaskConical, color: "var(--p2)" },
  other: { Icon: Paperclip, color: "var(--text-muted)" },
};

// ── 체크 항목 한 줄 (체크박스 + 텍스트) ───────────────────────────
function CheckLine({ text, color }: { text: string; color: string }) {
  return (
    <li className="flex items-start gap-2 rounded-[var(--r-sm)] bg-bg" style={{ padding: "8px 10px", border: "1px solid var(--border)" }}>
      <span aria-hidden className="shrink-0 rounded-[3px] mt-0.5" style={{ width: 15, height: 15, border: `2px solid ${color}`, flexShrink: 0 }} />
      <span className="text-text" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)" }}>{text}</span>
    </li>
  );
}

// ── 소그룹 (제목 + 항목 그리드) ───────────────────────────────────
function SubGroup({
  Icon,
  title,
  color,
  count,
  children,
}: {
  Icon: LucideIcon;
  title: string;
  color: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2" style={{ marginBottom: "var(--s-2)" }}>
        <Icon size={15} style={{ color }} aria-hidden />
        <span className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>{title}</span>
        <span className="rounded-full font-semibold text-text-on-color" style={{ background: color, fontSize: 11, padding: "1px 8px" }}>{count}</span>
      </div>
      {children}
    </div>
  );
}

interface KitDoc {
  purpose: string;
  rationale?: string;
  knowledge?: string[];
  prerequisites?: { kind: string; label: string }[];
  experiments?: string[];
  certTests?: string[];
  requiredData?: string[];
  prepDocs?: string[];
  relatedConceptSlugs: string[];
  refs: string[];
}

type TabKey = "guide" | "source" | "ref" | "docs";

/**
 * 문서 작성 패키지 — 한 문서를 쓰는 데 필요한 준비물을 한 상자에 담아
 * 4개 구성품 탭으로 보여준다: 가이드 · 내용 소스 · 지침서 · 참고 문서.
 */
export function WritingKit({ doc, color }: { doc: KitDoc; color: string }) {
  const counts = {
    guide: (doc.knowledge?.length ?? 0),
    source:
      (doc.requiredData?.length ?? 0) +
      (doc.experiments?.length ?? 0) +
      (doc.certTests?.length ?? 0) +
      (doc.prerequisites?.length ?? 0),
    ref: doc.refs.length + doc.relatedConceptSlugs.length,
    docs: doc.prepDocs?.length ?? 0,
  };

  const TABS: { key: TabKey; label: string; Icon: LucideIcon; hint: string }[] = useMemo(
    () => [
      { key: "guide", label: "가이드", Icon: Compass, hint: "어떻게 쓰는지 먼저 볼까요" },
      { key: "source", label: "내용 소스", Icon: PackageIcon, hint: "본문에 채울 자료·실험·테스트" },
      { key: "ref", label: "지침서", Icon: BookMarked, hint: "따라야 할 규정·개념" },
      { key: "docs", label: "참고 문서", Icon: Files, hint: "함께 보면 좋은 다른 문서" },
    ],
    []
  );

  // 콘텐츠가 있는 탭만 노출. 가이드는 항상 노출(3단계 안내가 항상 있음).
  const visibleTabs = TABS.filter((t) => t.key === "guide" || counts[t.key] > 0);
  const [active, setActive] = useState<TabKey>("guide");
  const activeTab = visibleTabs.find((t) => t.key === active) ?? visibleTabs[0];
  const totalItems = counts.guide + counts.source + counts.ref + counts.docs;

  return (
    <div
      className="rounded-[var(--r-lg)] overflow-hidden"
      style={{ border: `1.5px solid ${color}`, boxShadow: "var(--shadow-card)" }}
    >
      {/* ── 패키지 뚜껑: 헤더 + 탭 바 ───────────────────────── */}
      <div style={{ background: `color-mix(in srgb, ${color} 9%, var(--surface))`, borderBottom: `1px solid color-mix(in srgb, ${color} 22%, transparent)` }}>
        <div className="flex items-center gap-3" style={{ padding: "var(--s-4) var(--s-4) var(--s-3)" }}>
          <span className="grid shrink-0 place-items-center rounded-[var(--r-md)]" style={{ width: 38, height: 38, background: color }} aria-hidden>
            <PackageIcon size={20} style={{ color: "#fff" }} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-text" style={{ fontSize: "var(--t-lg)" }}>문서 작성 패키지</span>
              {totalItems > 0 && (
                <span className="rounded-full font-bold" style={{ background: color, color: "var(--text-on-color)", fontSize: 11, padding: "1px 9px" }}>
                  구성품 {totalItems}
                </span>
              )}
            </div>
            <p className="text-text-muted" style={{ fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)", marginTop: 1 }}>
              이 문서 하나 완성하는 데 필요한 걸 한 상자에 담았어요 · 탭을 열어 챙겨보세요
            </p>
          </div>
        </div>

        {/* 구성품 탭 */}
        <div className="flex flex-wrap gap-1.5" style={{ padding: "0 var(--s-4) var(--s-3)" }} role="tablist">
          {visibleTabs.map((t) => {
            const on = active === t.key;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={on}
                onClick={() => setActive(t.key)}
                className="inline-flex items-center gap-1.5 rounded-[var(--r-full)] font-semibold transition-all"
                style={{
                  fontSize: "var(--t-sm)",
                  padding: "7px 14px",
                  background: on ? color : "var(--bg)",
                  color: on ? "var(--text-on-color)" : "var(--text-muted)",
                  border: `1px solid ${on ? color : "var(--border)"}`,
                  boxShadow: on ? "var(--shadow-card)" : "none",
                }}
              >
                <t.Icon size={15} aria-hidden />
                {t.label}
                {counts[t.key] > 0 && (
                  <span
                    className="rounded-full font-bold"
                    style={{
                      fontSize: 10,
                      padding: "0px 6px",
                      background: on ? "rgba(255,255,255,.25)" : "var(--surface)",
                      color: on ? "var(--text-on-color)" : "var(--text-subtle)",
                    }}
                  >
                    {counts[t.key]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 패키지 속 내용: 탭 패널 ─────────────────────────── */}
      <div style={{ padding: "var(--s-4)", background: "var(--bg)" }}>
        {/* 활성 탭 한 줄 안내 */}
        {activeTab && (
          <div className="flex items-center gap-2" style={{ marginBottom: "var(--s-3)" }}>
            <span className="rounded-full" style={{ width: 6, height: 6, background: color }} aria-hidden />
            <span className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>{activeTab.label}</span>
            <span className="text-text-muted" style={{ fontSize: "var(--t-xs)" }}>· {activeTab.hint}</span>
          </div>
        )}

        {/* ▸ 가이드 */}
        {active === "guide" && (
          <div className="flex flex-col" style={{ gap: "var(--s-4)" }}>
            {/* 3단계 작성 흐름 */}
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "var(--s-3)" }}>
              {([
                { n: "1", title: "준비물 챙기기", desc: "위 탭들을 둘러보며 규정·자료·참고 문서를 먼저 챙겨요" },
                { n: "2", title: "템플릿 채우기", desc: "아래 템플릿에 예시가 미리 들어 있어요. 우리 기기에 맞게 고치면 자동 저장돼요" },
                { n: "3", title: "완성하고 내보내기", desc: "오른쪽 체크리스트를 확인하고 MD 복사나 Word로 내보내면 끝이에요" },
              ] as const).map(({ n, title, desc }) => (
                <div key={n} className="flex gap-3 items-start rounded-[var(--r-md)]" style={{ border: "1px solid var(--border)", background: "var(--surface)", padding: "var(--s-3)" }}>
                  <span className="shrink-0 grid place-items-center rounded-full font-extrabold text-text-on-color" style={{ width: 26, height: 26, background: color, fontSize: 12 }} aria-hidden>{n}</span>
                  <div>
                    <p className="font-bold text-text" style={{ fontSize: "var(--t-sm)", marginBottom: 2 }}>{title}</p>
                    <p className="text-text-muted" style={{ fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)" }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 왜 쓰는가 */}
            {doc.rationale && (
              <div className="flex gap-2 rounded-[var(--r-md)]" style={{ background: "var(--info-bg)", border: "1px solid var(--info)", padding: "var(--s-3) var(--s-4)" }}>
                <Lightbulb size={15} style={{ color: "var(--info)", flexShrink: 0, marginTop: 1 }} aria-hidden />
                <p className="text-text" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)" }}>
                  <span className="font-bold" style={{ color: "var(--info)" }}>왜 쓰는가 </span>
                  {doc.rationale}
                </p>
              </div>
            )}

            {/* 사전 지식 */}
            {doc.knowledge && doc.knowledge.length > 0 && (
              <SubGroup Icon={GraduationCap} title="작성 전 알아둘 것" color="var(--info)" count={doc.knowledge.length}>
                <ul className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
                  {doc.knowledge.map((k, i) => <CheckLine key={i} text={k} color="var(--info)" />)}
                </ul>
              </SubGroup>
            )}
          </div>
        )}

        {/* ▸ 내용 소스 */}
        {active === "source" && (
          <div className="flex flex-col" style={{ gap: "var(--s-4)" }}>
            {doc.requiredData && doc.requiredData.length > 0 && (
              <SubGroup Icon={BookMarked} title="확보할 자료" color="var(--p4)" count={doc.requiredData.length}>
                <ul className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
                  {doc.requiredData.map((d, i) => <CheckLine key={i} text={d} color="var(--p4)" />)}
                </ul>
              </SubGroup>
            )}

            {doc.prerequisites && doc.prerequisites.length > 0 && (
              <SubGroup Icon={PackageCheck} title="준비물" color="var(--warning)" count={doc.prerequisites.length}>
                <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
                  {doc.prerequisites.map((p, i) => {
                    const st = PREREQ_STYLE[p.kind as PrereqKind] ?? PREREQ_STYLE.other;
                    return (
                      <div key={i} className="flex items-start gap-2 rounded-[var(--r-sm)] bg-bg" style={{ border: "1px solid var(--border)", padding: "8px 10px" }}>
                        <span className="grid shrink-0 place-items-center rounded-[var(--r-sm)]" style={{ width: 28, height: 28, background: "var(--surface)" }}>
                          <st.Icon size={15} style={{ color: st.color }} aria-hidden />
                        </span>
                        <div className="min-w-0">
                          <span className="inline-block rounded-full font-bold" style={{ color: st.color, fontSize: 10, background: "var(--surface)", padding: "0px 6px" }}>{prereqKindLabel[p.kind as PrereqKind]}</span>
                          <p className="text-text" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)", marginTop: 2 }}>{p.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SubGroup>
            )}

            {doc.experiments && doc.experiments.length > 0 && (
              <SubGroup Icon={FlaskConical} title="선행 실험" color="var(--p1)" count={doc.experiments.length}>
                <ul className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
                  {doc.experiments.map((e, i) => <CheckLine key={i} text={e} color="var(--p1)" />)}
                </ul>
              </SubGroup>
            )}

            {doc.certTests && doc.certTests.length > 0 && (
              <SubGroup Icon={ListChecks} title="인증·테스트" color="var(--p3)" count={doc.certTests.length}>
                <ul className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
                  {doc.certTests.map((c, i) => <CheckLine key={i} text={c} color="var(--p3)" />)}
                </ul>
              </SubGroup>
            )}
          </div>
        )}

        {/* ▸ 지침서 (규정·개념) */}
        {active === "ref" && (
          <div className="flex flex-col" style={{ gap: "var(--s-4)" }}>
            {doc.refs.length > 0 && (
              <SubGroup Icon={BookMarked} title="근거 규정·조항" color="var(--text-muted)" count={doc.refs.length}>
                <div className="flex flex-wrap gap-2">
                  {doc.refs.map((r) => (
                    <span key={r} className="rounded-[var(--r-sm)] font-mono text-text-muted" style={{ background: "var(--surface)", border: "1px solid var(--border)", fontSize: 12, padding: "5px 10px" }}>
                      {r}
                    </span>
                  ))}
                </div>
              </SubGroup>
            )}

            {doc.relatedConceptSlugs.length > 0 && (
              <SubGroup Icon={Lightbulb} title="관련 개념 (위키)" color="var(--info)" count={doc.relatedConceptSlugs.length}>
                <div className="flex flex-wrap gap-1.5">
                  {doc.relatedConceptSlugs.map((slug) => <ConceptChip key={slug} slug={slug} />)}
                </div>
              </SubGroup>
            )}
          </div>
        )}

        {/* ▸ 참고 문서 */}
        {active === "docs" && doc.prepDocs && doc.prepDocs.length > 0 && (
          <SubGroup Icon={Files} title="먼저 만들면 좋은 문서" color="var(--success)" count={doc.prepDocs.length}>
            <div className="flex flex-wrap gap-2">
              {doc.prepDocs.map((pid) => {
                const l = leafById(pid);
                if (!l) return null;
                const c = `var(${colorForLeaf(pid)})`;
                return (
                  <Link
                    key={pid}
                    to={`/doc/${pid}`}
                    className="inline-flex items-center gap-2 rounded-[var(--r-full)] bg-bg transition-colors hover:bg-surface"
                    style={{ border: "1px solid var(--border)", padding: "7px 13px" }}
                  >
                    <span aria-hidden className="inline-block shrink-0 rounded-full" style={{ width: 7, height: 7, background: c }} />
                    <span className="font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>{l.title}</span>
                    <ArrowUpRight size={13} style={{ color: "var(--text-subtle)" }} aria-hidden />
                  </Link>
                );
              })}
            </div>
          </SubGroup>
        )}
      </div>
    </div>
  );
}
