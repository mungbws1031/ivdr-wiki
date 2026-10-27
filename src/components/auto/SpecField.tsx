import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { FieldDef } from "../../data/spec/fields";
import type { KitComponent } from "../../data/spec/types";

const inputStyle: React.CSSProperties = {
  border: "1.5px solid var(--border)",
  background: "var(--bg)",
  fontSize: "var(--t-sm)",
  padding: "8px 12px",
  minHeight: 40,
  borderRadius: "var(--r-sm)",
  width: "100%",
  color: "var(--text)",
};

/** 텍스트·숫자 입력 — 입력 중에는 로컬 상태, 400ms 뒤 저장 (InlineEditor 와 같은 방식). */
function DebouncedInput({
  id, value, kind, placeholder, onCommit, multiline,
}: {
  id: string; value: string; kind: "text" | "number"; placeholder?: string; multiline?: boolean;
  onCommit: (v: string) => void;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  useEffect(() => {
    if (local === value) return;
    const t = setTimeout(() => onCommit(local), 400);
    return () => clearTimeout(t);
  }, [local, value, onCommit]);
  const common = {
    id, value: local, placeholder,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setLocal(e.target.value),
    onBlur: () => local !== value && onCommit(local),
    style: inputStyle,
  };
  return multiline ? (
    <textarea {...common} rows={2} style={{ ...inputStyle, resize: "vertical", lineHeight: "var(--lh-base)" }} />
  ) : (
    <input {...common} type={kind === "number" ? "number" : "text"} inputMode={kind === "number" ? "decimal" : undefined} />
  );
}

function Choice({
  label, active, disabled, hint, onClick,
}: { label: string; active: boolean; disabled?: boolean; hint?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      title={hint}
      className="rounded-full font-semibold transition-colors"
      style={{
        fontSize: "var(--t-sm)",
        padding: "6px 14px",
        minHeight: 36,
        border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
        background: active ? "var(--accent-weak)" : "var(--bg)",
        color: disabled ? "var(--text-subtle)" : active ? "var(--accent)" : "var(--text)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {label}
      {hint && <span style={{ fontSize: "var(--t-xs)", marginLeft: 6, color: "var(--text-subtle)" }}>{hint}</span>}
    </button>
  );
}

function Components({ value, onChange }: { value: KitComponent[]; onChange: (v: KitComponent[]) => void }) {
  const rows = value.length ? value : [];
  const update = (i: number, patch: Partial<KitComponent>) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  return (
    <div className="flex flex-col" style={{ gap: "var(--s-2)" }}>
      {rows.map((r, i) => (
        <div key={i} className="grid items-center" style={{ gridTemplateColumns: "minmax(0,1fr) 84px auto auto", gap: "var(--s-2)" }}>
          <DebouncedInput id={`kit-${i}-name`} kind="text" value={r.name} placeholder="구성품 이름" onCommit={(v) => update(i, { name: v })} />
          <DebouncedInput
            id={`kit-${i}-qty`} kind="number" value={r.qtyPerKit === null ? "" : String(r.qtyPerKit)} placeholder="수량"
            onCommit={(v) => update(i, { qtyPerKit: v.trim() === "" || !Number.isFinite(Number(v)) ? null : Number(v) })}
          />
          <label className="inline-flex items-center gap-1 text-text-muted" style={{ fontSize: "var(--t-xs)", whiteSpace: "nowrap" }}>
            <input type="checkbox" checked={r.isReagent} onChange={(e) => update(i, { isReagent: e.target.checked })} />
            시약 포함
          </label>
          <button
            type="button" aria-label={`${r.name || "구성품"} 삭제`} onClick={() => onChange(rows.filter((_, j) => j !== i))}
            className="inline-flex items-center justify-center rounded-[var(--r-sm)] hover:bg-surface"
            style={{ width: 36, height: 36, color: "var(--text-subtle)" }}
          >
            <Trash2 size={16} aria-hidden />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...rows, { name: "", qtyPerKit: null, isReagent: false }])}
        className="inline-flex items-center gap-1.5 self-start rounded-[var(--r-sm)] font-semibold hover:bg-surface"
        style={{ fontSize: "var(--t-sm)", padding: "6px 10px", color: "var(--info)" }}
      >
        <Plus size={15} aria-hidden /> 구성품 추가
      </button>
    </div>
  );
}

export function SpecField({
  def, value, onChange,
}: { def: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  const id = `spec-${def.path.replace(/\./g, "-")}`;
  const isUnknown = value === null || value === undefined;

  let control: React.ReactNode;
  switch (def.kind) {
    case "text":
    case "textarea":
      control = (
        <DebouncedInput
          id={id} kind="text" multiline={def.kind === "textarea"} value={typeof value === "string" ? value : ""}
          placeholder={def.placeholder} onCommit={(v) => onChange(v.trim() === "" ? null : v)}
        />
      );
      break;
    case "number":
      control = (
        <div className="flex items-center" style={{ gap: "var(--s-2)", maxWidth: 240 }}>
          <DebouncedInput
            id={id} kind="number" value={typeof value === "number" ? String(value) : ""} placeholder={def.placeholder}
            onCommit={(v) => onChange(v.trim() === "" || !Number.isFinite(Number(v)) ? null : Number(v))}
          />
          {def.unit && <span className="text-text-muted" style={{ fontSize: "var(--t-sm)", whiteSpace: "nowrap" }}>{def.unit}</span>}
        </div>
      );
      break;
    case "select":
    case "tri":
      control = (
        <div className="flex flex-wrap" style={{ gap: "var(--s-2)" }} role="group" aria-labelledby={`${id}-label`}>
          {def.options!.map((o) => {
            const v = def.kind === "tri" ? o.value === "true" : o.value;
            return (
              <Choice key={o.value} label={o.label} hint={o.hint} disabled={o.disabled} active={value === v} onClick={() => onChange(value === v ? null : v)} />
            );
          })}
        </div>
      );
      break;
    case "multi": {
      const arr = Array.isArray(value) ? (value as string[]) : [];
      control = (
        <div className="flex flex-wrap" style={{ gap: "var(--s-2)" }} role="group" aria-labelledby={`${id}-label`}>
          {def.options!.map((o) => {
            const on = arr.includes(o.value);
            return (
              <Choice
                key={o.value} label={o.label} active={on}
                onClick={() => {
                  const next = on ? arr.filter((x) => x !== o.value) : [...arr, o.value];
                  onChange(next.length ? next : null);
                }}
              />
            );
          })}
        </div>
      );
      break;
    }
    case "components":
      control = <Components value={Array.isArray(value) ? (value as KitComponent[]) : []} onChange={(v) => onChange(v)} />;
      break;
  }

  const filled = def.kind === "components" ? Array.isArray(value) && value.length > 0 : !isUnknown;

  return (
    <div id={`field-${def.path}`} className="flex flex-col" style={{ gap: "var(--s-2)", scrollMarginTop: 96 }}>
      <div className="flex items-baseline flex-wrap" style={{ gap: "var(--s-2)" }}>
        <label id={`${id}-label`} htmlFor={def.kind === "text" || def.kind === "textarea" || def.kind === "number" ? id : undefined} className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>
          {def.label}
        </label>
        {def.optional ? (
          <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>선택</span>
        ) : !filled ? (
          <span className="font-semibold" style={{ fontSize: "var(--t-xs)", color: "var(--danger)" }}>미입력</span>
        ) : null}
      </div>
      {def.help && <p className="text-text-muted" style={{ fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)", marginTop: -2 }}>{def.help}</p>}
      {control}
    </div>
  );
}
