import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Check, ClipboardList, Download, Eye, FileText, RotateCcw, Sparkles, Upload } from "lucide-react";
import { PageHeader } from "../PageHeader";
import { SpecField } from "./SpecField";
import { AutoSteps } from "./AutoSteps";
import { ConceptBox } from "./ConceptBox";
import { specSections } from "../../data/spec/fields";
import { completion, composeIntendedPurpose, exampleSpec, getAt, unresolvedFields } from "../../data/spec/validate";
import { replaceSpec, reloadSpec, resetSpec, setSpecField, useSpec } from "../../hooks/useSpecStore";
import { reloadResults } from "../../hooks/useResultsStore";
import { applyBackup, exportAll, exportSpecOnly, parseBackup, requestPersistentStorage, type ParsedBackup } from "../../lib/backup";

type Confirm =
  | { kind: "reset" }
  | { kind: "example" }
  | { kind: "import"; parsed: ParsedBackup; fileName: string }
  | null;

function ToolButton({ icon: Icon, label, onClick, tone = "default" }: { icon: typeof Download; label: string; onClick: () => void; tone?: "default" | "primary" }) {
  const primary = tone === "primary";
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-[var(--r-md)] font-semibold transition-colors"
      style={{
        fontSize: "var(--t-sm)", padding: "8px 14px", minHeight: 40,
        background: primary ? "var(--accent)" : "var(--bg)",
        color: primary ? "var(--text-on-color)" : "var(--text)",
        border: primary ? "none" : "1px solid var(--border-strong)",
      }}
    >
      <Icon size={15} aria-hidden /> {label}
    </button>
  );
}

/** /auto — 제품 정보 입력. 자동작성 툴의 출발점 (A단계: 입력·저장·백업까지). */
export function SpecPage() {
  const spec = useSpec();
  const { filled, total } = completion(spec);
  const missing = unresolvedFields(spec);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { void requestPersistentStorage(); }, []);
  // /auto#field-<경로> 로 들어오면 그 입력칸으로 이동 (분류 화면의 "답하지 않은 항목" 링크)
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash.startsWith("#field-")) return;
    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!el) return;
    el.scrollIntoView({ block: "center" });
    el.querySelector<HTMLElement>("input, textarea, button")?.focus({ preventScroll: true });
  }, [hash]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(t);
  }, [notice]);

  const onField = useCallback((path: string, v: unknown) => setSpecField(path, v), []);
  const isEmpty = filled === 0 && !spec.identity.basicUdiDi;

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      const parsed = parseBackup(await f.text());
      setConfirm({ kind: "import", parsed, fileName: f.name });
    } catch (err) {
      setNotice({ tone: "error", text: (err as Error).message });
    }
  };

  const doImport = (mode: "merge" | "overwrite") => {
    if (confirm?.kind !== "import") return;
    try {
      applyBackup(confirm.parsed, mode);
      reloadSpec();
      reloadResults();
      setNotice({ tone: "ok", text: `${confirm.parsed.keyCount}개 항목을 ${mode === "merge" ? "합쳤어요" : "덮어썼어요"}. 문서 초안, 체크, 일정에도 함께 반영돼요.` });
    } catch {
      setNotice({ tone: "error", text: "브라우저에 저장하지 못했어요. 저장 공간이나 사생활 보호 설정을 확인해 주세요." });
    }
    setConfirm(null);
  };

  const pct = Math.round((filled / total) * 100);

  return (
    <div className="min-h-screen bg-bg">
      <PageHeader crumb="제품 정보" accentColor="var(--accent)" />
      <main className="mx-auto" style={{ maxWidth: "var(--max-w)", padding: "var(--s-8) var(--margin) var(--s-16)" }}>
        {/* 머리말 */}
        <header className="flex flex-col" style={{ gap: "var(--s-3)", marginBottom: "var(--s-6)" }}>
          <AutoSteps current="/auto" />
          <span
            className="inline-flex items-center gap-1.5 self-start rounded-full font-bold"
            style={{ fontSize: "var(--t-xs)", padding: "3px 10px", background: "var(--accent-weak)", color: "var(--accent)" }}
          >
            <Sparkles size={13} aria-hidden /> 자동작성 · 베타
          </span>
          <h1 className="font-extrabold text-text" style={{ fontSize: "var(--t-2xl)", lineHeight: "var(--lh-tight)" }}>제품 정보</h1>
          <p className="text-text-muted" style={{ fontSize: "var(--t-base)", maxWidth: 720 }}>
            여기에 한 번 적으면 등급 추천, 필요한 문서, 실험계획, 문서 초안이 모두 이 내용으로 만들어져요.
            모르는 칸은 비워 두세요. 앱이 추측하지 않고 "사람이 할 일"로 남겨 둬요.
          </p>

          <div className="flex flex-wrap items-center" style={{ gap: "var(--s-3)", marginTop: "var(--s-2)" }}>
            <div
              className="flex items-center rounded-[var(--r-md)]"
              style={{ gap: "var(--s-3)", padding: "8px 14px", background: "var(--surface)", border: "1px solid var(--border)", minWidth: 220 }}
              role="status"
            >
              <span className="font-bold text-text" style={{ fontSize: "var(--t-sm)", fontVariantNumeric: "tabular-nums" }}>
                {filled} / {total}칸 채움
              </span>
              <span className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: "var(--border)", minWidth: 80 }}>
                <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: pct === 100 ? "var(--success)" : "var(--accent)", transition: "width .3s" }} />
              </span>
            </div>
            {!isEmpty && (
              <Link
                to="/auto/overview"
                className="inline-flex items-center gap-1.5 rounded-[var(--r-md)] font-bold"
                style={{ fontSize: "var(--t-sm)", padding: "8px 18px", minHeight: 40, background: "var(--accent)", color: "var(--text-on-color)" }}
              >
                <Eye size={16} aria-hidden /> 결과 보기 <ArrowRight size={15} aria-hidden />
              </Link>
            )}
            <ToolButton icon={Sparkles} label="예시로 채우기" onClick={() => (isEmpty ? replaceSpec(exampleSpec()) : setConfirm({ kind: "example" }))} tone={isEmpty ? "primary" : "default"} />
            <ToolButton icon={Download} label="전체 백업" onClick={() => setNotice({ tone: "ok", text: `${exportAll()}개 항목을 백업 파일로 내려받았어요.` })} />
            <ToolButton icon={FileText} label="제품 정보만 내보내기" onClick={() => exportSpecOnly(spec)} />
            <ToolButton icon={Upload} label="파일 불러오기" onClick={() => fileRef.current?.click()} />
            <ToolButton icon={RotateCcw} label="모두 지우기" onClick={() => setConfirm({ kind: "reset" })} />
            <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onPickFile} />
          </div>

          {notice && (
            <div
              role="status"
              className="rounded-[var(--r-md)]"
              style={{
                padding: "10px 14px", fontSize: "var(--t-sm)",
                background: notice.tone === "ok" ? "var(--success-bg)" : "var(--danger-bg)",
                color: notice.tone === "ok" ? "var(--success)" : "var(--danger)",
              }}
            >
              {notice.text}
            </div>
          )}

          {confirm && (
            <div className="rounded-[var(--r-md)] flex flex-col" style={{ gap: "var(--s-3)", padding: "var(--s-4)", border: "1.5px solid var(--warning)", background: "var(--warning-bg)" }}>
              {confirm.kind === "reset" && (
                <>
                  <p className="text-text" style={{ fontSize: "var(--t-sm)" }}>제품 정보를 모두 지울까요? 문서 초안과 체크는 그대로 남아요. 지우기 전에 "전체 백업"을 해 두면 좋아요.</p>
                  <div className="flex flex-wrap" style={{ gap: "var(--s-2)" }}>
                    <ToolButton icon={RotateCcw} label="네, 지울게요" tone="primary" onClick={() => { resetSpec(); setConfirm(null); setNotice({ tone: "ok", text: "제품 정보를 지웠어요." }); }} />
                    <ToolButton icon={Check} label="취소" onClick={() => setConfirm(null)} />
                  </div>
                </>
              )}
              {confirm.kind === "example" && (
                <>
                  <p className="text-text" style={{ fontSize: "var(--t-sm)" }}>지금 적은 제품 정보가 예시(LH 배란 자가검사)로 바뀌어요. 바꿀까요?</p>
                  <div className="flex flex-wrap" style={{ gap: "var(--s-2)" }}>
                    <ToolButton icon={Sparkles} label="예시로 바꾸기" tone="primary" onClick={() => { replaceSpec(exampleSpec()); setConfirm(null); }} />
                    <ToolButton icon={Check} label="취소" onClick={() => setConfirm(null)} />
                  </div>
                </>
              )}
              {confirm.kind === "import" && (
                <>
                  <p className="text-text" style={{ fontSize: "var(--t-sm)" }}>
                    <b>{confirm.fileName}</b> — {confirm.parsed.file.kind === "spec" ? "제품 정보 파일" : `전체 백업 ${confirm.parsed.keyCount}개 항목`}
                    {confirm.parsed.file.exportedAt && ` · ${new Date(confirm.parsed.file.exportedAt).toLocaleString("ko-KR")}에 내보낸 파일`}
                  </p>
                  <p className="text-text-muted" style={{ fontSize: "var(--t-xs)" }}>
                    합치기: 파일에 있는 항목만 바꾸고 나머지는 그대로 둬요. 덮어쓰기: 이 브라우저에 있는 작업(제품 정보·초안·체크·일정)을 모두 지우고 파일 내용으로 바꿔요.
                  </p>
                  <div className="flex flex-wrap" style={{ gap: "var(--s-2)" }}>
                    <ToolButton icon={Upload} label="합치기" tone="primary" onClick={() => doImport("merge")} />
                    <ToolButton icon={RotateCcw} label="덮어쓰기" onClick={() => doImport("overwrite")} />
                    <ToolButton icon={Check} label="취소" onClick={() => setConfirm(null)} />
                  </div>
                </>
              )}
            </div>
          )}
        </header>

        <div style={{ marginBottom: "var(--s-6)" }}><ConceptBox /></div>

        <div className="grid items-start grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px]" style={{ gap: "var(--s-6)" }}>
          {/* 입력 섹션 */}
          <div className="flex flex-col min-w-0" style={{ gap: "var(--s-4)" }}>
            {specSections.map((sec, i) => (
              <section
                key={sec.id}
                className="rounded-[var(--r-lg)] border bg-bg"
                style={{ borderColor: "var(--border)", padding: "var(--s-6)", boxShadow: "var(--shadow-card)" }}
                aria-labelledby={`sec-${sec.id}`}
              >
                <div className="flex items-baseline" style={{ gap: "var(--s-2)", marginBottom: 4 }}>
                  <span className="font-bold text-text-subtle" style={{ fontSize: "var(--t-xs)", fontVariantNumeric: "tabular-nums" }}>{String(i + 1).padStart(2, "0")}</span>
                  <h2 id={`sec-${sec.id}`} className="font-extrabold text-text" style={{ fontSize: "var(--t-lg)" }}>{sec.title}</h2>
                </div>
                <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginBottom: "var(--s-4)" }}>{sec.desc}</p>
                <div className="grid" style={{ gap: "var(--s-4)", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))" }}>
                  {sec.fields.map((f) => (
                    <div key={f.path} style={{ gridColumn: f.kind === "textarea" || f.kind === "components" || (f.options && f.options.length > 3) ? "1 / -1" : undefined }}>
                      <SpecField def={f} value={getAt(spec, f.path)} onChange={(v) => onField(f.path, v)} />
                    </div>
                  ))}
                </div>
              </section>
            ))}
            <Link
              to="/auto/overview"
              className="flex flex-wrap items-center justify-between rounded-[var(--r-lg)]"
              style={{ gap: "var(--s-3)", padding: "var(--s-6)", background: "var(--accent)", color: "var(--text-on-color)" }}
            >
              <span>
                <span className="block font-extrabold" style={{ fontSize: "var(--t-lg)" }}>다 적었으면 결과를 확인해 보세요</span>
                <span className="block" style={{ fontSize: "var(--t-sm)", opacity: 0.9 }}>
                  등급, 필요한 문서, 자동으로 채운 문서, 실험계획을 한 화면에서 볼 수 있어요{missing.length ? `. 비어 있는 ${missing.length}칸은 빈칸으로 남겨 둬요` : ""}.
                </span>
              </span>
              <span className="inline-flex items-center gap-1 font-bold rounded-[var(--r-md)]" style={{ padding: "10px 18px", background: "var(--bg)", color: "var(--accent)", fontSize: "var(--t-sm)" }}>
                결과 보기 <ArrowRight size={16} aria-hidden />
              </span>
            </Link>
          </div>

          {/* 요약 사이드 */}
          <aside className="flex flex-col min-w-0 lg:sticky lg:top-20" style={{ gap: "var(--s-4)" }}>
            <section className="rounded-[var(--r-lg)] border" style={{ borderColor: "var(--border)", background: "var(--surface)", padding: "var(--s-4)" }}>
              <h2 className="font-bold text-text" style={{ fontSize: "var(--t-sm)", marginBottom: "var(--s-2)" }}>의도된 목적 미리보기</h2>
              <p className="text-text" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)" }}>{composeIntendedPurpose(spec)}</p>
              <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginTop: "var(--s-2)" }}>적은 내용으로 자동으로 만든 문장이에요. 다음 단계에서 '의도된 목적' 문서에 들어가요.</p>
            </section>

            <section className="rounded-[var(--r-lg)] border" style={{ borderColor: missing.length ? "var(--danger)" : "var(--success)", background: "var(--bg)", padding: "var(--s-4)" }}>
              <h2 className="flex items-center gap-1.5 font-bold" style={{ fontSize: "var(--t-sm)", marginBottom: "var(--s-2)", color: missing.length ? "var(--danger)" : "var(--success)" }}>
                <ClipboardList size={15} aria-hidden /> {missing.length ? `아직 비어 있는 칸 ${missing.length}개` : "꼭 필요한 칸을 다 채웠어요"}
              </h2>
              {missing.length > 0 ? (
                <ul className="flex flex-col" style={{ gap: 2, maxHeight: 320, overflowY: "auto" }}>
                  {missing.map((f) => (
                    <li key={f.path}>
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById(`field-${f.path}`);
                          el?.scrollIntoView({ behavior: "smooth", block: "center" });
                          el?.querySelector<HTMLElement>("input, textarea, button")?.focus({ preventScroll: true });
                        }}
                        className="w-full text-left rounded-[var(--r-sm)] hover:bg-surface"
                        style={{ fontSize: "var(--t-sm)", padding: "4px 8px", color: "var(--text)" }}
                      >
                        {f.label}
                        <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginLeft: 6 }}>문서 {f.usedBy.length}개에 쓰여요</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-text-muted" style={{ fontSize: "var(--t-sm)" }}>다음 단계에서 이 제품 정보로 등급을 추천하고 필요한 문서를 골라 드려요.</p>
              )}
            </section>

            <Link
              to="/auto/overview"
              className="flex items-center justify-between rounded-[var(--r-lg)] font-bold"
              style={{ padding: "var(--s-4)", background: "var(--accent)", color: "var(--text-on-color)", fontSize: "var(--t-sm)" }}
            >
              <span className="inline-flex items-center gap-1.5"><Eye size={16} aria-hidden /> 결과 보기</span> <span aria-hidden>→</span>
            </Link>

            <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)" }}>
              적은 내용은 자동으로 저장되고, 이 브라우저에만 남아요. 브라우저 데이터를 지우면 사라지니 "전체 백업"으로 파일을 받아 두세요.
              {spec.meta.updatedAt && <><br />마지막 저장: {new Date(spec.meta.updatedAt).toLocaleString("ko-KR")}</>}
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}
