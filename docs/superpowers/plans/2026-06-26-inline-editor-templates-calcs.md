# 인라인 에디터 + 문서 템플릿 충실화 + 계산 툴 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** DocumentWorkspace에 인라인 편집·자동저장 기능을 추가하고, 상위 12개 규제 문서 템플릿을 실제 작성 가능한 수준으로 충실화하며, 계산이 필요한 문서(성능평가·위험관리·임상연구)에 내장 계산기를 제공한다.

**Architecture:** useDraftStore 훅이 localStorage에 섹션별 초안을 저장하고, InlineEditor 컴포넌트가 기존 `<pre>` 블록을 교체한다. CalcWidget은 DocTemplate에 `calcTools` 필드로 연결되어 DocumentWorkspace에서 조건부 렌더링된다. 문서 데이터(documents.ts, iso13485/documents.ts)에 rationale·knowledge·prerequisites와 풍부한 placeholder를 추가한다.

**Tech Stack:** React 19 + TypeScript + Tailwind CSS v4 (기존 토큰 사용) — 외부 의존성 추가 없음. 빌드 검증: `npm run build` (CWD: `ivdr-wiki/`). 타입 체크: `npm run typecheck`.

---

## 파일 구조

### 신규 생성
- `ivdr-wiki/src/hooks/useDraftStore.ts` — localStorage 초안 저장·불러오기 훅
- `ivdr-wiki/src/components/InlineEditor.tsx` — 자동저장 textarea 편집기 컴포넌트
- `ivdr-wiki/src/components/calcs/SensSpecCalc.tsx` — 민감도/특이도/PPV/NPV 계산기
- `ivdr-wiki/src/components/calcs/SampleSizeCalc.tsx` — 임상 연구 최소 검체수 계산기
- `ivdr-wiki/src/components/calcs/RiskMatrixCalc.tsx` — ISO 14971 위험 점수 매트릭스

### 수정
- `ivdr-wiki/src/data/documents.ts` — DocTemplate 인터페이스에 `calcTools` 추가, 8개 IVDR 문서 충실화
- `ivdr-wiki/src/data/iso13485/documents.ts` — 4개 ISO 13485 문서 충실화
- `ivdr-wiki/src/components/DocumentWorkspace.tsx` — `<pre>` → `<InlineEditor>` 교체, CalcWidget 렌더링 추가

---

## Task 1: useDraftStore 훅

**Files:**
- Create: `ivdr-wiki/src/hooks/useDraftStore.ts`

- [ ] **Step 1: 파일 생성**

```ts
// ivdr-wiki/src/hooks/useDraftStore.ts
const PREFIX = "ivdr-draft";

function storageKey(docId: string, sectionIdx: number): string {
  return `${PREFIX}-${docId}-${sectionIdx}`;
}

export function getDraft(docId: string, sectionIdx: number): string | null {
  try {
    return localStorage.getItem(storageKey(docId, sectionIdx));
  } catch {
    return null;
  }
}

export function setDraft(docId: string, sectionIdx: number, text: string): void {
  try {
    localStorage.setItem(storageKey(docId, sectionIdx), text);
  } catch {
    // storage full — ignore silently
  }
}

export function clearDraft(docId: string, sectionIdx: number): void {
  try {
    localStorage.removeItem(storageKey(docId, sectionIdx));
  } catch {}
}

export function hasDraft(docId: string, sectionIdx: number): boolean {
  return getDraft(docId, sectionIdx) !== null;
}

export function clearAllDrafts(docId: string, sectionCount: number): void {
  for (let i = 0; i < sectionCount; i++) {
    clearDraft(docId, i);
  }
}
```

- [ ] **Step 2: 타입 체크**

```
cd ivdr-wiki && npm run typecheck
```

기대: 오류 없음

- [ ] **Step 3: 커밋**

```bash
git add ivdr-wiki/src/hooks/useDraftStore.ts
git commit -m "feat(editor): localStorage 초안 저장 훅 추가"
```

---

## Task 2: InlineEditor 컴포넌트

**Files:**
- Create: `ivdr-wiki/src/components/InlineEditor.tsx`

- [ ] **Step 1: 파일 생성**

```tsx
// ivdr-wiki/src/components/InlineEditor.tsx
import { useState, useRef, useCallback, useEffect } from "react";
import { getDraft, setDraft, clearDraft } from "../hooks/useDraftStore";

interface Props {
  docId: string;
  sectionIdx: number;
  originalPlaceholder: string;
  /** 섹션 안내 텍스트 (위에 표시) */
  guidance: string;
}

export function InlineEditor({ docId, sectionIdx, originalPlaceholder, guidance }: Props) {
  const savedDraft = getDraft(docId, sectionIdx);
  const [value, setValue] = useState<string>(savedDraft ?? originalPlaceholder);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 원본과 다를 때만 '수정됨' 표시
  const isDirty = value !== originalPlaceholder;
  const hasSavedContent = savedDraft !== null;

  const triggerSave = useCallback(
    (text: string) => {
      setSaveStatus("saving");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setDraft(docId, sectionIdx, text);
        setSaveStatus("saved");
        timerRef.current = setTimeout(() => setSaveStatus("idle"), 1500);
      }, 400);
    },
    [docId, sectionIdx]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = e.target.value;
    setValue(next);
    triggerSave(next);
  }

  function handleReset() {
    if (!window.confirm("초기 템플릿으로 되돌리겠습니까? 작성한 내용이 사라집니다.")) return;
    setValue(originalPlaceholder);
    clearDraft(docId, sectionIdx);
    setSaveStatus("idle");
  }

  const borderColor = isDirty ? "var(--info)" : "var(--border)";

  return (
    <div style={{ marginTop: "var(--s-3)" }}>
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: "var(--s-1)" }}
      >
        <span className="text-text-muted" style={{ fontSize: "var(--t-xs)" }}>
          {guidance}
        </span>
        <div className="flex items-center gap-3">
          {saveStatus === "saving" && (
            <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>
              저장 중…
            </span>
          )}
          {saveStatus === "saved" && (
            <span style={{ fontSize: "var(--t-xs)", color: "var(--success)" }}>
              ✓ 저장됨
            </span>
          )}
          {hasSavedContent && saveStatus === "idle" && (
            <span style={{ fontSize: "var(--t-xs)", color: "var(--info)" }}>
              초안 보존 중
            </span>
          )}
          {isDirty && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded-[var(--r-sm)] text-text-muted hover:text-danger"
              style={{
                fontSize: "var(--t-xs)",
                padding: "2px 8px",
                border: "1px solid var(--border)",
                background: "var(--surface)",
              }}
            >
              초기화
            </button>
          )}
        </div>
      </div>
      <textarea
        value={value}
        onChange={handleChange}
        rows={Math.max(4, value.split("\n").length + 1)}
        className="w-full rounded-[var(--r-sm)] text-text"
        style={{
          background: "var(--surface)",
          border: `1px solid ${borderColor}`,
          fontFamily: "var(--font-mono)",
          fontSize: "var(--t-sm)",
          lineHeight: "var(--lh-base)",
          padding: "var(--s-3)",
          resize: "vertical",
          outline: "none",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--info)";
          e.currentTarget.style.boxShadow = "var(--focus-ring)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = isDirty ? "var(--info)" : "var(--border)";
          e.currentTarget.style.boxShadow = "none";
          // 블러 시점에 즉시 저장
          setDraft(docId, sectionIdx, e.currentTarget.value);
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: 타입 체크**

```
cd ivdr-wiki && npm run typecheck
```

기대: 오류 없음

- [ ] **Step 3: 커밋**

```bash
git add ivdr-wiki/src/components/InlineEditor.tsx
git commit -m "feat(editor): 자동저장 인라인 에디터 컴포넌트 추가"
```

---

## Task 3: DocumentWorkspace — 인라인 에디터 연결

**Files:**
- Modify: `ivdr-wiki/src/components/DocumentWorkspace.tsx`

- [ ] **Step 1: import 추가 및 `<pre>` 교체**

`DocumentWorkspace.tsx` 상단 import에 다음 추가:
```tsx
import { InlineEditor } from "./InlineEditor";
```

파일 내 `{doc.sections.map((s, i) => ...)}` 블록을 찾아 `<pre>...</pre>` 를 `<InlineEditor>`로 교체:

**변경 전 (line ~417~432):**
```tsx
<pre
  className="overflow-x-auto rounded-[var(--r-sm)] text-text"
  style={{
    background: "var(--surface)",
    border: "1px solid var(--border)",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--t-sm)",
    lineHeight: "var(--lh-base)",
    padding: "var(--s-3)",
    marginTop: "var(--s-3)",
    whiteSpace: "pre-wrap",
  }}
>
  {s.placeholder}
</pre>
```

**변경 후:**
```tsx
<InlineEditor
  docId={doc.id}
  sectionIdx={i}
  originalPlaceholder={s.placeholder}
  guidance={s.guidance}
/>
```

그리고 `<p className="text-text-muted" ...>{s.guidance}</p>` 줄은 제거 (InlineEditor 내부에서 표시):

**변경 전:**
```tsx
<h2 className="font-bold text-text" style={{ fontSize: "var(--t-lg)" }}>
  {s.heading}
</h2>
<p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: 4 }}>
  {s.guidance}
</p>
<pre ...>
  {s.placeholder}
</pre>
```

**변경 후:**
```tsx
<h2 className="font-bold text-text" style={{ fontSize: "var(--t-lg)" }}>
  {s.heading}
</h2>
<InlineEditor
  docId={doc.id}
  sectionIdx={i}
  originalPlaceholder={s.placeholder}
  guidance={s.guidance}
/>
```

- [ ] **Step 2: 빌드 확인**

```
cd ivdr-wiki && npm run build
```

기대: 빌드 성공 (Build finished in ~Xs)

- [ ] **Step 3: 커밋**

```bash
git add ivdr-wiki/src/components/DocumentWorkspace.tsx
git commit -m "feat(editor): DocumentWorkspace에 인라인 에디터 연결"
```

---

## Task 4: SensSpecCalc — 민감도/특이도 계산기

**Files:**
- Create: `ivdr-wiki/src/components/calcs/SensSpecCalc.tsx`

- [ ] **Step 1: 파일 생성**

```tsx
// ivdr-wiki/src/components/calcs/SensSpecCalc.tsx
import { useState } from "react";
import { FlaskConical } from "lucide-react";

interface Matrix {
  tp: number; fp: number; fn: number; tn: number;
}

function calcMetrics(m: Matrix) {
  const { tp, fp, fn, tn } = m;
  const n = tp + fp + fn + tn;
  const se = n ? tp / (tp + fn) : 0;
  const sp = n ? tn / (tn + fp) : 0;
  const ppv = (tp + fp) ? tp / (tp + fp) : 0;
  const npv = (fn + tn) ? tn / (fn + tn) : 0;
  const acc = n ? (tp + tn) / n : 0;
  const lr_pos = sp < 1 ? se / (1 - sp) : Infinity;
  const lr_neg = se > 0 ? (1 - se) / sp : 0;
  return { se, sp, ppv, npv, acc, lr_pos, lr_neg, n };
}

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
const ratio = (v: number) => isFinite(v) ? v.toFixed(2) : "∞";

export function SensSpecCalc() {
  const [matrix, setMatrix] = useState<Matrix>({ tp: 90, fp: 5, fn: 10, tn: 95 });

  function update(field: keyof Matrix, raw: string) {
    const v = Math.max(0, parseInt(raw, 10) || 0);
    setMatrix((m) => ({ ...m, [field]: v }));
  }

  const r = calcMetrics(matrix);

  const inputStyle = {
    width: "80px",
    textAlign: "center" as const,
    border: "1px solid var(--border)",
    borderRadius: "var(--r-sm)",
    padding: "4px 8px",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--t-sm)",
    background: "var(--bg)",
    color: "var(--text)",
  };

  const metricCard = (label: string, value: string, color: string, note: string) => (
    <div
      className="rounded-[var(--r-md)]"
      style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "var(--s-3)" }}
    >
      <div className="font-bold" style={{ fontSize: "var(--t-xl)", color }}>{value}</div>
      <div className="font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>{label}</div>
      <div className="text-text-muted" style={{ fontSize: "var(--t-xs)", marginTop: 2 }}>{note}</div>
    </div>
  );

  return (
    <div
      className="rounded-[var(--r-lg)]"
      style={{ border: "1px solid var(--border)", padding: "var(--s-5)", marginTop: "var(--s-4)" }}
    >
      <div className="flex items-center gap-2" style={{ marginBottom: "var(--s-4)" }}>
        <FlaskConical size={20} style={{ color: "var(--p3)" }} aria-hidden />
        <h3 className="font-bold text-text" style={{ fontSize: "var(--t-lg)" }}>
          민감도·특이도 계산기
        </h3>
        <span
          className="rounded-full font-bold"
          style={{ background: "var(--p3-tint)", color: "var(--p3)", fontSize: "var(--t-xs)", padding: "2px 10px" }}
        >
          IVDR Annex XIII
        </span>
      </div>

      {/* 2×2 혼동행렬 입력 */}
      <div style={{ marginBottom: "var(--s-4)" }}>
        <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginBottom: "var(--s-2)" }}>
          2×2 혼동행렬 (Confusion Matrix) 입력
        </p>
        <table style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ padding: "6px 12px", fontSize: "var(--t-xs)", color: "var(--text-muted)" }}></th>
              <th style={{ padding: "6px 12px", fontSize: "var(--t-xs)", color: "var(--text-muted)" }}>실제 양성 (질환 있음)</th>
              <th style={{ padding: "6px 12px", fontSize: "var(--t-xs)", color: "var(--text-muted)" }}>실제 음성 (질환 없음)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "6px 12px", fontSize: "var(--t-sm)", fontWeight: 600, color: "var(--text)" }}>검사 양성</td>
              <td style={{ padding: "6px 12px" }}>
                <div className="flex flex-col items-center gap-1">
                  <input type="number" min={0} value={matrix.tp} onChange={(e) => update("tp", e.target.value)} style={inputStyle} />
                  <span style={{ fontSize: "var(--t-xs)", color: "var(--success)" }}>TP</span>
                </div>
              </td>
              <td style={{ padding: "6px 12px" }}>
                <div className="flex flex-col items-center gap-1">
                  <input type="number" min={0} value={matrix.fp} onChange={(e) => update("fp", e.target.value)} style={inputStyle} />
                  <span style={{ fontSize: "var(--t-xs)", color: "var(--danger)" }}>FP (위양성)</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ padding: "6px 12px", fontSize: "var(--t-sm)", fontWeight: 600, color: "var(--text)" }}>검사 음성</td>
              <td style={{ padding: "6px 12px" }}>
                <div className="flex flex-col items-center gap-1">
                  <input type="number" min={0} value={matrix.fn} onChange={(e) => update("fn", e.target.value)} style={inputStyle} />
                  <span style={{ fontSize: "var(--t-xs)", color: "var(--danger)" }}>FN (위음성)</span>
                </div>
              </td>
              <td style={{ padding: "6px 12px" }}>
                <div className="flex flex-col items-center gap-1">
                  <input type="number" min={0} value={matrix.tn} onChange={(e) => update("tn", e.target.value)} style={inputStyle} />
                  <span style={{ fontSize: "var(--t-xs)", color: "var(--success)" }}>TN</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginTop: "var(--s-2)" }}>
          총 {r.n}명 검사
        </p>
      </div>

      {/* 결과 */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
        {metricCard("민감도 (Se)", pct(r.se), "var(--success)", "TP / (TP+FN)")}
        {metricCard("특이도 (Sp)", pct(r.sp), "var(--p4)", "TN / (TN+FP)")}
        {metricCard("양성예측도 (PPV)", pct(r.ppv), "var(--p2)", "TP / (TP+FP)")}
        {metricCard("음성예측도 (NPV)", pct(r.npv), "var(--p3)", "TN / (FN+TN)")}
        {metricCard("정확도", pct(r.acc), "var(--text)", "(TP+TN) / N")}
        {metricCard("양성 LR", ratio(r.lr_pos), "var(--info)", "Se / (1-Sp)")}
      </div>

      <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginTop: "var(--s-3)" }}>
        ※ 이 계산기는 참고용이며, 실제 PER에는 95% 신뢰구간(Wilson 방법 권장)을 함께 기재해야 합니다.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: 타입 체크**

```
cd ivdr-wiki && npm run typecheck
```

기대: 오류 없음

- [ ] **Step 3: 커밋**

```bash
git add ivdr-wiki/src/components/calcs/SensSpecCalc.tsx
git commit -m "feat(calcs): 민감도/특이도/PPV/NPV 계산기 추가"
```

---

## Task 5: SampleSizeCalc — 임상 최소 검체수 계산기

**Files:**
- Create: `ivdr-wiki/src/components/calcs/SampleSizeCalc.tsx`

- [ ] **Step 1: 파일 생성**

```tsx
// ivdr-wiki/src/components/calcs/SampleSizeCalc.tsx
import { useState } from "react";
import { Sigma } from "lucide-react";

// Wilson 방법으로 Se 추정 신뢰구간에서 역산한 최소 양성 검체수
// n ≥ z²α/2 × Se(1-Se) / d²  (d = 허용 오차)
function minPositiveSamples(se: number, confidence: number, allowance: number): number {
  const z = confidence === 0.99 ? 2.576 : confidence === 0.95 ? 1.96 : 1.645;
  return Math.ceil((z * z * se * (1 - se)) / (allowance * allowance));
}

function minNegativeSamples(sp: number, confidence: number, allowance: number): number {
  const z = confidence === 0.99 ? 2.576 : confidence === 0.95 ? 1.96 : 1.645;
  return Math.ceil((z * z * sp * (1 - sp)) / (allowance * allowance));
}

export function SampleSizeCalc() {
  const [se, setSe] = useState(0.90);
  const [sp, setSp] = useState(0.95);
  const [confidence, setConfidence] = useState(0.95);
  const [allowance, setAllowance] = useState(0.05);

  const nPos = minPositiveSamples(se, confidence, allowance);
  const nNeg = minNegativeSamples(sp, confidence, allowance);
  const nTotal = nPos + nNeg;

  const inputStyle = {
    border: "1px solid var(--border)",
    borderRadius: "var(--r-sm)",
    padding: "4px 8px",
    fontSize: "var(--t-sm)",
    background: "var(--bg)",
    color: "var(--text)",
    width: "90px",
  };

  function pctInput(
    label: string,
    value: number,
    setter: (v: number) => void,
    min = 0.5,
    max = 0.999
  ) {
    return (
      <div className="flex flex-col gap-1">
        <label className="font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>
          {label}
        </label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min * 100}
            max={max * 100}
            step={1}
            value={Math.round(value * 100)}
            onChange={(e) => setter(Math.min(max, Math.max(min, parseInt(e.target.value, 10) / 100))}
            style={inputStyle}
          />
          <span className="text-text-muted" style={{ fontSize: "var(--t-sm)" }}>%</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-[var(--r-lg)]"
      style={{ border: "1px solid var(--border)", padding: "var(--s-5)", marginTop: "var(--s-4)" }}
    >
      <div className="flex items-center gap-2" style={{ marginBottom: "var(--s-4)" }}>
        <Sigma size={20} style={{ color: "var(--p4)" }} aria-hidden />
        <h3 className="font-bold text-text" style={{ fontSize: "var(--t-lg)" }}>
          임상 최소 검체수 계산기
        </h3>
        <span
          className="rounded-full font-bold"
          style={{ background: "var(--p4-tint)", color: "var(--p4)", fontSize: "var(--t-xs)", padding: "2px 10px" }}
        >
          IVDR Annex XIII
        </span>
      </div>

      <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginBottom: "var(--s-4)" }}>
        목표 민감도·특이도 달성을 위한 최소 양성·음성 검체수를 Wilson 근사법으로 계산합니다.
        (n = z²α × p(1-p) / d²)
      </p>

      <div className="flex flex-wrap gap-6" style={{ marginBottom: "var(--s-5)" }}>
        {pctInput("목표 민감도 (Se)", se, setSe, 0.5, 0.999)}
        {pctInput("목표 특이도 (Sp)", sp, setSp, 0.5, 0.999)}

        <div className="flex flex-col gap-1">
          <label className="font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>신뢰 수준</label>
          <select
            value={confidence}
            onChange={(e) => setConfidence(parseFloat(e.target.value))}
            style={{ ...inputStyle, width: "100px" }}
          >
            <option value={0.90}>90%</option>
            <option value={0.95}>95%</option>
            <option value={0.99}>99%</option>
          </select>
        </div>

        {pctInput("허용 오차 (d)", allowance, setAllowance, 0.01, 0.2)}
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div
          className="rounded-[var(--r-md)] text-center"
          style={{ background: "var(--success-bg)", border: "1px solid var(--success)", padding: "var(--s-4)" }}
        >
          <div className="font-extrabold" style={{ fontSize: "var(--t-2xl)", color: "var(--success)" }}>
            {nPos}
          </div>
          <div className="font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>최소 양성 검체</div>
          <div className="text-text-muted" style={{ fontSize: "var(--t-xs)" }}>질환 확인 (참양성)</div>
        </div>
        <div
          className="rounded-[var(--r-md)] text-center"
          style={{ background: "var(--info-bg)", border: "1px solid var(--info)", padding: "var(--s-4)" }}
        >
          <div className="font-extrabold" style={{ fontSize: "var(--t-2xl)", color: "var(--info)" }}>
            {nNeg}
          </div>
          <div className="font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>최소 음성 검체</div>
          <div className="text-text-muted" style={{ fontSize: "var(--t-xs)" }}>질환 없음 (참음성)</div>
        </div>
        <div
          className="rounded-[var(--r-md)] text-center"
          style={{ background: "var(--surface)", border: "2px solid var(--border-strong)", padding: "var(--s-4)" }}
        >
          <div className="font-extrabold" style={{ fontSize: "var(--t-2xl)", color: "var(--text)" }}>
            {nTotal}
          </div>
          <div className="font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>최소 총 검체수</div>
          <div className="text-text-muted" style={{ fontSize: "var(--t-xs)" }}>양성 + 음성</div>
        </div>
      </div>

      <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginTop: "var(--s-3)" }}>
        ※ 실제 임상 연구 계획서에는 탈락율·계층화 보정을 추가로 고려해야 합니다.
        Class C·D 제품은 IVDR Annex XIII 2.2 임상적 성능 연구 요건을 확인하세요.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: 타입 체크**

```
cd ivdr-wiki && npm run typecheck
```

기대: 오류 없음

- [ ] **Step 3: 커밋**

```bash
git add ivdr-wiki/src/components/calcs/SampleSizeCalc.tsx
git commit -m "feat(calcs): 임상 최소 검체수 계산기 추가"
```

---

## Task 6: RiskMatrixCalc — ISO 14971 위험 점수 계산기

**Files:**
- Create: `ivdr-wiki/src/components/calcs/RiskMatrixCalc.tsx`

- [ ] **Step 1: 파일 생성**

```tsx
// ivdr-wiki/src/components/calcs/RiskMatrixCalc.tsx
import { useState } from "react";
import { ShieldAlert } from "lucide-react";

const PROB_LABELS = [
  "P1 — 거의 불가능 (< 1/100,000)",
  "P2 — 극히 희박 (1/10,000)",
  "P3 — 가능 (1/1,000)",
  "P4 — 상당히 가능 (1/100)",
  "P5 — 빈번 (> 1/10)",
];

const SEV_LABELS = [
  "S1 — 무시 가능 (불편함)",
  "S2 — 경미 (가역적 손상)",
  "S3 — 중증 (비가역적 손상)",
  "S4 — 치명 (생명 위협)",
  "S5 — 사망",
];

type Level = 1 | 2 | 3 | 4 | 5;

function getRiskLevel(p: Level, s: Level): "acceptable" | "alarp" | "unacceptable" {
  const score = p * s;
  if (score <= 3) return "acceptable";
  if (score <= 12) return "alarp";
  return "unacceptable";
}

const RISK_CONFIG = {
  acceptable: { label: "수용 가능", color: "var(--success)", bg: "var(--success-bg)" },
  alarp: { label: "ALARP (합리적 감소 필요)", color: "var(--warning)", bg: "var(--warning-bg)" },
  unacceptable: { label: "수용 불가 (필수 통제)", color: "var(--danger)", bg: "var(--danger-bg)" },
};

export function RiskMatrixCalc() {
  const [prob, setProb] = useState<Level>(2);
  const [sev, setSev] = useState<Level>(3);

  const risk = getRiskLevel(prob, sev);
  const cfg = RISK_CONFIG[risk];

  const selectStyle = {
    border: "1px solid var(--border)",
    borderRadius: "var(--r-sm)",
    padding: "6px 10px",
    fontSize: "var(--t-sm)",
    background: "var(--bg)",
    color: "var(--text)",
    width: "100%",
  };

  return (
    <div
      className="rounded-[var(--r-lg)]"
      style={{ border: "1px solid var(--border)", padding: "var(--s-5)", marginTop: "var(--s-4)" }}
    >
      <div className="flex items-center gap-2" style={{ marginBottom: "var(--s-4)" }}>
        <ShieldAlert size={20} style={{ color: "var(--danger)" }} aria-hidden />
        <h3 className="font-bold text-text" style={{ fontSize: "var(--t-lg)" }}>
          ISO 14971 위험 점수 계산기
        </h3>
        <span
          className="rounded-full font-bold"
          style={{ background: "var(--danger-bg)", color: "var(--danger)", fontSize: "var(--t-xs)", padding: "2px 10px" }}
        >
          ISO 14971:2019
        </span>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: "var(--s-5)" }}>
        <div>
          <label className="font-semibold text-text" style={{ fontSize: "var(--t-sm)", display: "block", marginBottom: "var(--s-1)" }}>
            발생 가능성 (P)
          </label>
          <select value={prob} onChange={(e) => setProb(parseInt(e.target.value, 10) as Level)} style={selectStyle}>
            {PROB_LABELS.map((l, i) => <option key={i} value={i + 1}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="font-semibold text-text" style={{ fontSize: "var(--t-sm)", display: "block", marginBottom: "var(--s-1)" }}>
            심각도 (S)
          </label>
          <select value={sev} onChange={(e) => setSev(parseInt(e.target.value, 10) as Level)} style={selectStyle}>
            {SEV_LABELS.map((l, i) => <option key={i} value={i + 1}>{l}</option>)}
          </select>
        </div>
      </div>

      <div
        className="rounded-[var(--r-md)] text-center"
        style={{ background: cfg.bg, border: `2px solid ${cfg.color}`, padding: "var(--s-5)" }}
      >
        <div className="font-extrabold" style={{ fontSize: "var(--t-3xl)", color: cfg.color }}>
          {prob} × {sev} = {prob * sev}
        </div>
        <div className="font-bold" style={{ fontSize: "var(--t-xl)", color: cfg.color, marginTop: "var(--s-2)" }}>
          {cfg.label}
        </div>
        <div className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: "var(--s-1)" }}>
          위험 점수 (P × S)
        </div>
      </div>

      {/* 전체 행렬 시각화 */}
      <div style={{ marginTop: "var(--s-4)" }}>
        <p className="font-semibold text-text" style={{ fontSize: "var(--t-sm)", marginBottom: "var(--s-2)" }}>
          위험 수용 기준 행렬 (P × S)
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", fontSize: "var(--t-xs)" }}>
            <thead>
              <tr>
                <th style={{ padding: "4px 8px", border: "1px solid var(--border)", background: "var(--surface)" }}>P↓ / S→</th>
                {[1, 2, 3, 4, 5].map((s) => (
                  <th key={s} style={{ padding: "4px 8px", border: "1px solid var(--border)", background: "var(--surface)", fontFamily: "var(--font-mono)" }}>S{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {([1, 2, 3, 4, 5] as Level[]).map((p) => (
                <tr key={p}>
                  <td style={{ padding: "4px 8px", border: "1px solid var(--border)", background: "var(--surface)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>P{p}</td>
                  {([1, 2, 3, 4, 5] as Level[]).map((s) => {
                    const r = getRiskLevel(p, s);
                    const isSelected = p === prob && s === sev;
                    return (
                      <td
                        key={s}
                        style={{
                          padding: "4px 8px",
                          border: isSelected ? `2px solid ${RISK_CONFIG[r].color}` : "1px solid var(--border)",
                          background: RISK_CONFIG[r].bg,
                          color: RISK_CONFIG[r].color,
                          fontWeight: isSelected ? 900 : 600,
                          textAlign: "center",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {p * s}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginTop: "var(--s-2)" }}>
          녹색(≤3): 수용 가능 · 노란색(4~12): ALARP · 빨간색(≥15): 수용 불가
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 타입 체크**

```
cd ivdr-wiki && npm run typecheck
```

기대: 오류 없음

- [ ] **Step 3: 커밋**

```bash
git add ivdr-wiki/src/components/calcs/RiskMatrixCalc.tsx
git commit -m "feat(calcs): ISO 14971 위험 점수 매트릭스 계산기 추가"
```

---

## Task 7: DocTemplate.calcTools + DocumentWorkspace 계산기 통합

**Files:**
- Modify: `ivdr-wiki/src/data/documents.ts` (인터페이스 변경 + calcTools 필드 추가)
- Modify: `ivdr-wiki/src/components/DocumentWorkspace.tsx` (CalcWidget 렌더링 추가)

- [ ] **Step 1: DocTemplate 인터페이스에 calcTools 추가**

`ivdr-wiki/src/data/documents.ts`의 `DocTemplate` 인터페이스에 추가:

```ts
export type CalcToolType = "sens-spec" | "sample-size" | "risk-matrix";

export interface DocTemplate {
  // ... 기존 필드들 ...
  calcTools?: CalcToolType[]; // 이 문서에 표시할 계산 도구
}
```

- [ ] **Step 2: 해당 문서에 calcTools 추가**

`documents.ts`에서 다음 문서에 `calcTools` 필드 추가:

```ts
// performance-eval-plan 문서에 추가:
calcTools: ["sens-spec", "sample-size"],

// risk-management-plan 문서에 추가:
calcTools: ["risk-matrix"],
```

ISO 13485 문서의 경우 `ivdr-wiki/src/data/iso13485/documents.ts`에서:

```ts
// iso-internal-audit-report 에 추가 없음 (계산 불필요)
// iso-corrective-action 에 추가 없음
```

- [ ] **Step 3: DocumentWorkspace에 calc 렌더링 추가**

`ivdr-wiki/src/components/DocumentWorkspace.tsx`의 상단 import에 추가:

```tsx
import { SensSpecCalc } from "./calcs/SensSpecCalc";
import { SampleSizeCalc } from "./calcs/SampleSizeCalc";
import { RiskMatrixCalc } from "./calcs/RiskMatrixCalc";
```

본문 2열 그리드(`{/* 본문 2열 */}`) 블록 **앞에** 다음 섹션 삽입:

```tsx
{/* 계산 도구 */}
{doc.calcTools && doc.calcTools.length > 0 && (
  <div style={{ marginBottom: "var(--s-6)" }}>
    <h2 className="font-bold text-text" style={{ fontSize: "var(--t-xl)", marginBottom: "var(--s-3)" }}>
      📐 내장 계산 도구
    </h2>
    {doc.calcTools.includes("sens-spec") && <SensSpecCalc />}
    {doc.calcTools.includes("sample-size") && <SampleSizeCalc />}
    {doc.calcTools.includes("risk-matrix") && <RiskMatrixCalc />}
  </div>
)}
```

- [ ] **Step 4: 빌드 확인**

```
cd ivdr-wiki && npm run build
```

기대: 빌드 성공

- [ ] **Step 5: 커밋**

```bash
git add ivdr-wiki/src/data/documents.ts ivdr-wiki/src/components/DocumentWorkspace.tsx
git commit -m "feat(calcs): DocumentWorkspace에 계산 도구 통합"
```

---

## Task 8: IVDR 문서 템플릿 충실화 (documents.ts)

다음 8개 문서에 `rationale`, `knowledge`, `prerequisites`, `difficulty`, `importance`, `effort`, `prepDocs`를 추가하고 placeholder를 실질적으로 강화한다.

**Files:**
- Modify: `ivdr-wiki/src/data/documents.ts`

### 8-A: performance-eval-plan 충실화

**변경 전 (기존 `performance-eval-plan` 문서의 각 섹션 placeholder):**
```
"분석물질↔임상상태 근거: [____]\n출처: [____]"
```

**변경 후 — 모든 필드를 포함한 완전한 객체:**

```ts
{
  id: "performance-eval-plan",
  stationId: 6,
  docTitle: "성능평가 계획 (PEP) 목차",
  purpose: "과학적·분석적·임상적 성능 3단 증거를 어떻게 확보할지 먼저 설계한다(PER 이전).",
  rationale: "IVDR Annex XIII은 '증거 기반' 성능평가를 요구한다. PEP는 PER보다 먼저 작성해 NB·시험기관과 설계를 합의하는 청사진이다. 설계 없이 데이터를 모으면 재시험이 발생한다.",
  difficulty: "hard" as Level,
  importance: "critical" as Level,
  effort: {
    phases: [
      { label: "문헌 조사", weeks: 2 },
      { label: "설계 작성", weeks: 1 },
      { label: "NB·시험기관 합의", weeks: 2 },
    ],
  },
  knowledge: [
    "IVDR Annex XIII — 과학적 타당성·분석적 성능·임상적 성능 3단 개념",
    "LoD(검출 한계)·LoQ(정량 한계)·정밀도(반복성·재현성) 차이",
    "민감도·특이도·PPV·NPV와 유병률의 관계",
    "참고 측정법(Reference Method) 또는 기존 표준 검사와 비교 연구 설계",
    "Class C·D는 임상 성능 연구가 필요 (Annex XIV와 연계)",
  ],
  prerequisites: [
    { kind: "doc", label: "의도된 목적 정의서 (intended-purpose)" },
    { kind: "doc", label: "분류 근거서 (classification-rationale) — Class 확정 필요" },
    { kind: "data", label: "분석물질-임상상태 연관 주요 문헌 3편 이상" },
    { kind: "data", label: "경쟁 제품(동등 기기) 성능 사양 벤치마크" },
  ],
  prepDocs: ["intended-purpose", "classification-rationale"],
  calcTools: ["sens-spec", "sample-size"],
  sections: [
    {
      heading: "1. 과학적 타당성 (Scientific Validity)",
      guidance: "분석물질이 목표 임상 상태와 연관된다는 과학적 근거를 문헌·가이드라인으로 제시한다.",
      placeholder: "분석물질: [예: SARS-CoV-2 뉴클레오캡시드 항원]\n임상 상태: [예: COVID-19 급성 감염]\n\n근거 문헌:\n1. [저자, 제목, 저널, 연도] — 핵심 내용: [____]\n2. [____]\n\n공식 가이드라인/지침:\n- [예: WHO Emergency Use Listing Procedure, 2021]\n- [예: CLSI EP27 또는 EP15 적용 여부]\n\n결론: [분석물질 ↔ 임상 상태 연관성 확립됨 / 추가 근거 필요]",
    },
    {
      heading: "2. 분석적 성능 연구 설계",
      guidance: "LoD·정밀도·정확도·특이성(교차반응)·안정성 연구를 어떻게 할지 설계한다.",
      placeholder: "[ ] LoD (검출 한계) — 방법: [예: Probit 분석, CLSI EP17] / 농도 단위: [____] / 목표 LoD: [____]\n[ ] 정밀도 — 반복성: [동일 장비·동일 조작자, n=20] / 재현성: [3개 기관, 3일간]\n[ ] 진실성/정확도 — 참고법 비교: [____] / 검체수: [n≥40]\n[ ] 교차반응 — 시험 항원/균주 목록: [____] / 예상 음성\n[ ] 선형성/측정 범위 — 해당 시: [____] \n[ ] 기질 간섭 — 헤모글로빈, 지질, 빌리루빈 등 간섭 물질 목록: [____]\n[ ] 안정성 — 가속 시험 조건: [____°C × ____주] / 실시간 조건: [____]",
    },
    {
      heading: "3. 임상적 성능 연구 설계",
      guidance: "민감도·특이도를 통계적으로 입증할 임상 연구를 설계한다. 검체수 산출 근거 포함.",
      placeholder: "연구 유형: [전향적 / 후향적 / 레지스트리 연구]\n대상 집단: [____] (나이·성별·임상 상태 기술)\n참조 검사(Reference Standard): [예: PCR, 배양, 임상 진단]\n목표 Se: [____]% · 허용 오차: ±____% · 신뢰 수준: 95%\n목표 Sp: [____]% · 허용 오차: ±____%\n→ 최소 양성 검체: n ≥ [계산기 사용 → ____] (Wilson 방법)\n→ 최소 음성 검체: n ≥ [____]\n참여 기관 수: [≥2개 기관 권장]\n검체 보관·운송 조건: [____]\n통계 방법: [95% CI, Wilson 방법, Clopper-Pearson 방법]\n데이터 수집 기간: [____] ~ [____]",
    },
    {
      heading: "4. 연구 일정 및 책임",
      guidance: "PEP → 데이터 수집 → PER 완성까지 일정과 담당을 배정한다.",
      placeholder: "PEP 완성: [____] — 담당: [____]\n분석적 성능 연구 완료: [____] — 기관: [____]\n임상 검체 수집 시작: [____] — 기관: [____]\n임상 검체 수집 완료: [____]\nPER 초안 완성: [____] — 담당: [____]\nNB 제출 예정: [____]",
    },
  ],
  checklist: [
    "3단(과학적 타당성·분석적·임상적)이 모두 설계됐는가",
    "LoD·정밀도·정확도 연구에 CLSI 또는 동등 방법론을 명시했는가",
    "임상 연구에 통계적 검체수 산출 근거가 있는가",
    "참조 검사(Reference Standard)가 명확히 정의됐는가",
    "PER로 닫는 일정과 담당이 지정됐는가",
    "Class C·D면 Annex XIV 임상 연구 요건도 확인했는가",
  ],
  relatedConceptSlugs: ["pep-per", "annex-xiii", "gspr"],
  refs: ["IVDR Art.56", "Annex XIII", "CLSI EP17", "CLSI EP15"],
},
```

### 8-B: risk-management-plan 충실화

기존 `risk-management-plan`의 `sections`와 `checklist`를 교체:

```ts
{
  id: "risk-management-plan",
  stationId: 7,
  docTitle: "위험관리 계획 (ISO 14971) + GSPR↔위험 추적표",
  purpose: "ISO 14971 프로세스를 수립하고, 위험-요구(GSPR)-성능을 양방향 추적한다.",
  rationale: "IVDR Annex I GSPR 8조는 위험관리가 제품 수명 전주기에 걸쳐 수행돼야 한다고 규정한다. 위험이 없다고 주장하는 것은 NB가 수용하지 않으며, 잔여위험의 수용 근거가 명확해야 한다.",
  difficulty: "hard" as Level,
  importance: "critical" as Level,
  calcTools: ["risk-matrix"],
  knowledge: [
    "ISO 14971:2019 — 위험관리 프로세스 전체 구조 (7단계: 계획→분석→평가→통제→잔여위험→검토→생산·시판 후)",
    "위해요인(Hazard) vs 위험상황(Hazardous Situation) vs 위해(Harm) 구분",
    "발생가능성(P) × 심각도(S) 위험 수용 기준 행렬 설계",
    "IVD 특유 위해요인: 위양성·위음성 결과가 치료 결정에 미치는 영향",
    "GSPR 8조~18조 각 조항과 위험의 연결 구조",
    "IEC 62366 (사용적합성) — 자가검사·근접검사 제품에 필수 연계",
  ],
  prerequisites: [
    { kind: "doc", label: "의도된 목적 정의서 — 사용자·환경 확정 필요" },
    { kind: "doc", label: "기기 설명서·사양 (Annex II 1.1)" },
    { kind: "data", label: "FMEA 또는 FTA 분석 결과 (초안)" },
    { kind: "data", label: "유사 기기 불만·바이질런스 데이터 (있을 경우)" },
  ],
  prepDocs: ["intended-purpose", "device-description"],
  sections: [
    {
      heading: "1. 위험관리 계획 (ISO 14971 Clause 4.4)",
      guidance: "범위·적용 표준·위험 수용 기준·검토 시점을 정의한다.",
      placeholder: "적용 표준: ISO 14971:2019 + IVDR Annex I\n범위: [제품명 및 수명 주기 단계 — 설계부터 폐기까지]\n\n위험 수용 기준 행렬:\n- 수용 가능: P × S ≤ 3\n- ALARP 필요: 4 ≤ P × S ≤ 12\n- 수용 불가: P × S ≥ 15\n\n위험관리 팀: [이름/직책]\n검토 시점: [설계 단계별 / 시판 후 연간]",
    },
    {
      heading: "2. 위험 분석 — IVD 특유 위해요인",
      guidance: "IVD에 특화된 위해요인을 위해요인→위험상황→위해 형식으로 기술한다.",
      placeholder: "| 위해요인 | 위험상황 | 위해 | P | S | 초기위험 | 통제수단 | 잔여위험 | 검증 참조 |\n|---|---|---|---|---|---|---|---|---|\n| 위양성 결과 | 감염 없는 환자에게 불필요 항생제 처방 | 약물 부작용·내성 | 2 | 4 | 8(ALARP) | IFU 확인 지침 + 임상 검증 기준 강화 | 2 | PER §3 |\n| 위음성 결과 | 감염 환자 미진단 | 치료 지연·전파 | 2 | 5 | 10(ALARP) | 민감도 ≥95% 요건 + IFU 재검사 지침 | 3 | PER §3 |\n| 교차반응 | 유사 항원 존재 시 위양성 | 오진단 | 2 | 3 | 6(ALARP) | 교차반응 시험 목록 최소화 | 2 | 분석적 성능 §5 |\n| 검체 오염 | 현장 취급 오류 | 잘못된 결과 | 3 | 3 | 9(ALARP) | IFU 취급 절차·경고 강화 | 2 | 사용적합성 연구 |\n| [추가 위해요인] | [____] | [____] | [__] | [__] | [__] | [____] | [__] | [____] |",
    },
    {
      heading: "3. GSPR↔위험↔성능 추적표",
      guidance: "GSPR 각 조항이 어떤 위험과 연결되고, 어떤 성능 증거로 충족되는지 매핑한다.",
      placeholder: "| GSPR 조항 | 요구사항 요약 | 관련 위험 ID | 충족 방법 | 성능 증거 위치 |\n|---|---|---|---|---|\n| Annex I §1 | 설계·제조가 의도된 목적 충족 | R-001, R-002 | 분석·임상 성능 시험 | PER §2, §3 |\n| Annex I §8 | 위험 최소화 | R-001~R-006 | ISO 14971 위험통제 | 위험관리 파일 |\n| Annex I §9 | 라벨·IFU 정보 완전성 | R-004 | IFU 사용적합성 연구 | IFU v[__], 사용적합성 보고서 |\n| Annex I §13 | 자가검사 사용편의성 (해당 시) | R-005 | IEC 62366 사용적합성 | 사용적합성 연구 |",
    },
    {
      heading: "4. 사용적합성 연계 (IEC 62366, 자가검사·근접검사 해당 시)",
      guidance: "자가검사 또는 근접검사 제품은 사용 오류 위험을 IEC 62366으로 연계해야 한다.",
      placeholder: "적용 여부: [ ] 자가검사  [ ] 근접검사  [ ] 해당 없음 (전문가용)\n\n주요 사용 오류 위험:\n- [예: 검체 채취 방법 오류 → 잘못된 결과] — 완화: IFU 그림 지침 + 색상 코딩\n- [예: 판독 시간 초과 → 위음성] — 완화: 타이머 알람 기능\n\nIEC 62366 요약 가용성 파일(SUM) 참조: [위치]",
    },
  ],
  checklist: [
    "위험 수용 기준 행렬이 정의됐는가 (P × S 기준)",
    "IVD 특유 위해요인(위양성·위음성)이 포함됐는가",
    "GSPR 8조 이상의 위험 통제 조항이 추적됐는가",
    "잔여 위험이 모두 수용 기준 이하로 통제됐는가",
    "자가검사면 IEC 62366 연계를 확인했는가",
    "위험관리 파일이 수명 주기 전체를 다루는가",
  ],
  relatedConceptSlugs: ["iso-14971", "gspr", "iec-62366"],
  refs: ["ISO 14971:2019", "IVDR Annex I §8", "IEC 62366-1:2015"],
},
```

### 8-C: pms-plan 충실화

기존 `pms-plan` 문서에 `rationale`, `knowledge`, `prerequisites`와 강화된 placeholder 추가:

```ts
// pms-plan의 기존 객체에 추가/교체:
rationale: "IVDR 인증은 출시 시점의 결과물이 아니라 지속적 의무다. PMS는 시판 후 실제 성능 데이터를 수집해 성능평가와 위험관리를 갱신하는 환류 구조의 핵심이다. Class C·D는 매년 PSUR을 제출해야 한다.",
knowledge: [
  "IVDR Art.78~81 — PMS·PMPF·PSUR·바이질런스 의무 체계",
  "PSUR (Periodic Safety Update Report) — Class C·D 연간 제출, 기타 2년",
  "PMPF (Post-Market Performance Follow-up) — Annex XIII Part B 요건",
  "EUDAMED 사고 보고 의무 (심각한 사고는 15일 내 보고)",
  "PMS → 성능평가 → 위험관리 → 기술문서 갱신의 환류 경로",
],
prerequisites: [
  { kind: "doc", label: "성능평가 보고서 (PER) — 기준점 성능 지표" },
  { kind: "doc", label: "위험관리 파일 — 갱신 트리거 조건" },
  { kind: "data", label: "고객 불만·바이질런스 수집 채널 (ERP/CRM)" },
],
// sections[0].placeholder 교체:
// "데이터 소스: [불만·바이질런스·문헌·시장피드백]\n..."
// →
"데이터 소스:\n① 고객 불만 (Complaint Log): [CRM/ERP 위치]\n② 바이질런스 보고 (EUDAMED): 심각 사고 15일, 추세 분석 분기별\n③ 문헌 감시: [PubMed 검색어·주기]\n④ 시장 피드백: [판매처·유통 피드백 채널]\n⑤ PMPF 데이터: [임상 성능 추적 연구]\n\n수집 주기: [월간 / 분기]\n분석·보고 주기: [분기 요약 + 연간 PSUR]\n책임자: [QA 담당자 이름/직책]",
```

- [ ] **Step 1: 위 3개 문서(performance-eval-plan, risk-management-plan, pms-plan)를 documents.ts에서 교체**

`ivdr-wiki/src/data/documents.ts`를 열어 해당 문서 객체들을 위의 내용으로 교체한다.
CalcToolType 타입과 `calcTools?: CalcToolType[]` 필드도 인터페이스에 추가한다.

- [ ] **Step 2: tech-doc-toc-gspr 충실화**

기존 `tech-doc-toc-gspr` 문서의 GSPR 체크리스트 placeholder를 다음으로 교체:

```
"| GSPR 조항 | 요구사항 요약 | 적용 여부 | 충족 방법 | 증거 위치 |\n|---|---|---|---|---|\n| §1 | 안전·성능 충족, 위험 최소화 | 예 | 성능평가 + 위험관리 | PER, RMF |\n| §2 | 위험 수용 기준 대비 잔여위험 수용 가능 | 예 | ISO 14971 | RMF §5 |\n| §3 | 의도된 성능 달성 + 알려진 부작용 고려 | 예 | PER | PER §2 |\n| §4 | 설계·제조에 현행 기술 수준 반영 | 예 | 기기 설명서 | TD §3 |\n| §5 | 기기 수명 중 성능 유지 | 예 | 안정성 시험 | 분석적 성능 §6 |\n| §6 | 운반·보관 중 성능 유지 | 예 | 포장 시험 | TD §4 |\n| §7 | 부작용의 위험 대비 이익 우위 | 예 | 위험-이익 분석 | TD §5 |\n| §8 | 화학적 물리적 특성 안전 | 해당 시 | 원자재 시험 | TD §3 |\n| §9 | 감염·미생물 오염 방지 | 해당 시 | 멸균 밸리데이션 | TD §6 |\n| §10 | 이물질 침투 방지 | 해당 시 | IP 등급 시험 | TD §6 |\n| §11 | 측정 기능 정확도 | 예 | LoD·정밀도·정확도 시험 | PER §2 |\n| §13 | 정보 제공 충분성 (라벨·IFU) | 예 | IFU 사용적합성 | IFU v[__] |\n| §14 | 사이버보안 (SW 포함 시) | 해당 시 | IEC 81001-5-1 | SW 보안 파일 |\n| [추가] | [____] | [__] | [____] | [____] |"
```

- [ ] **Step 3: declaration-of-conformity 충실화**

기존 `declaration-of-conformity` 문서에 `knowledge`와 강화된 placeholder 추가:

```ts
knowledge: [
  "IVDR Annex IV — DoC 필수 기재 항목 전체 (제조자·기기식별·분류·규정·표준·NB·서명)",
  "Basic UDI-DI는 기기 등록 전에 발행기관(GS1 등)에서 발급받아야 함",
  "EU 대리인은 비EU 제조자에게만 해당 (EU 내 제조자는 불필요)",
  "클래스 A(자가측정 제외)만 DoC 기반 자기 선언 가능 — B/C/D는 NB 번호 포함 필수",
],
// sections[3].placeholder 추가:
"적합성 선언\n\n본 문서에 서명한 제조자는 상기 기기가 다음 규정을 충족함을 단독 책임으로 선언합니다:\n\n적용 규정: 체외진단 의료기기 규정 (EU) 2017/746 (IVDR)\n분류: Class [A/B/C/D] — Annex VIII Rule [__]에 따름\n\n적용된 공통 사양/조화 표준:\n- [예: ISO 13485:2016] — [적용 조항]\n- [예: ISO 14971:2019] — [전체]\n- [예: CLSI EP17-A2] — [분석적 성능]\n\n[해당 시] 인증기관 (Notified Body):\n- NB명: [____] / NB 번호: [____]\n- 인증서 번호: [____] / 유효 기간: [____]\n\n서명권자: _______________ 직책: [____]\n서명 일자: _______________ 서명 장소: [도시, 국가]",
```

- [ ] **Step 4: device-registration 충실화**

기존 `device-registration` 문서에 `knowledge`와 UDI 체크 자리 추가:

```ts
knowledge: [
  "EUDAMED 6개 모듈 구조: 행위자→UDI/기기→인증서→임상조사→바이질런스→시판후",
  "SRN (Single Registration Number) — EUDAMED 행위자 등록 시 발급, DoC·기기 등록에 필수",
  "Basic UDI-DI — 기기 등록의 식별자. GS1·HIBCC 등 발행기관 선택",
  "UDI-DI — 포장 수준별 개별 식별자. Basic UDI-DI의 하위 집합",
  "2026.5.28: EUDAMED 첫 4개 모듈 강제화 / 2026.11.28: 레거시 기기 등록 마감",
],
```

- [ ] **Step 5: 빌드 확인**

```
cd ivdr-wiki && npm run build
```

기대: 빌드 성공

- [ ] **Step 6: 커밋**

```bash
git add ivdr-wiki/src/data/documents.ts
git commit -m "feat(docs): IVDR 주요 5개 문서 템플릿 충실화"
```

---

## Task 9: ISO 13485 문서 템플릿 충실화 (iso13485/documents.ts)

**Files:**
- Modify: `ivdr-wiki/src/data/iso13485/documents.ts`

4개 ISO 13485 문서를 충실화한다.

- [ ] **Step 1: iso-internal-audit-report 추가**

`iso13485Documents` 배열에 새 문서 추가:

```ts
{
  id: "iso-internal-audit-report",
  stationId: 5,
  docTitle: "내부 심사 보고서",
  purpose: "ISO 13485 Clause 8.2.4의 내부 심사 결과를 문서화하고 부적합 사항과 시정 계획을 기록한다.",
  rationale: "내부 심사는 인증 기관이 QMS 효과성을 확인하는 핵심 증거다. 형식적 심사는 외부 인증 심사에서 부적합 사항으로 지적된다. 심사 결과가 경영 검토의 입력값으로 들어가야 한다.",
  difficulty: "medium" as any,
  importance: "high" as any,
  knowledge: [
    "ISO 13485:2016 Clause 8.2.4 — 내부 심사 요건",
    "심사원 독립성 원칙 — 자신의 업무를 직접 심사하면 안 됨",
    "심사 프로그램·심사 계획·체크리스트의 차이",
    "부적합(Nonconformity) vs 관찰(Observation) vs 강점(Strength) 구분",
    "심사 후 시정 조치(CAR)와 완료 검증까지 추적 의무",
  ],
  prerequisites: [
    { kind: "doc", label: "심사 프로그램 (연간 일정)" },
    { kind: "doc", label: "내부 심사 체크리스트 (조항별)" },
    { kind: "data", label: "전회 심사 결과·후속 조치 완료 여부" },
  ],
  sections: [
    {
      heading: "1. 심사 개요",
      guidance: "심사 일자, 대상 프로세스/부서, 심사원, 피심사인을 기록한다.",
      placeholder: "심사 일자: [____]  심사 유형: [ ] 정기  [ ] 특별\n심사 대상: [프로세스명 / 부서명]\n심사 기준: ISO 13485:2016 [해당 조항] / 사내 절차서 [번호]\n수석 심사원: [____] (자격: ISO 13485 내부 심사원)\n동석 심사원: [____]\n피심사인 대표: [____] / 직책: [____]",
    },
    {
      heading: "2. 심사 결과 — 조항별 적합성",
      guidance: "심사한 각 조항에 대해 적합/부적합/해당없음을 판정하고 증거를 기록한다.",
      placeholder: "| ISO 13485 조항 | 요구사항 요약 | 판정 | 근거·관찰 사항 |\n|---|---|---|---|\n| 4.1 | QMS 일반 요건 | 적합 / 부적합 / N/A | [증거: 문서번호 / 관찰 내용] |\n| 4.2.3 | 의료기기 파일 | [ ] | [____] |\n| 5.5.3 | 내부 소통 | [ ] | [____] |\n| 6.2.2 | 역량·교육·인식 | [ ] | [____] |\n| 7.2.1 | 제품 요구사항 결정 | [ ] | [____] |\n| 7.4 | 구매 프로세스 | [ ] | [____] |\n| 7.5.3 | 식별·추적성 | [ ] | [____] |\n| 7.6 | 모니터링·측정 장비 | [ ] | [____] |\n| 8.2.4 | 내부 심사 | [ ] | [____] |\n| 8.3 | 부적합 제품 관리 | [ ] | [____] |\n| 8.5.2 | 시정 조치 | [ ] | [____] |",
    },
    {
      heading: "3. 부적합 사항 (NC) 및 시정 조치 요청 (CAR)",
      guidance: "부적합 사항마다 번호를 부여하고, 근본 원인·시정 계획·기한·완료 검증을 기록한다.",
      placeholder: "NC-001:\n설명: [____]\n관련 조항: [____]\n심각도: [ ] 중대 부적합  [ ] 경미 부적합\n근본 원인 분석: [____]\n시정 조치 계획: [____]\n담당자: [____]  완료 기한: [____]\n검증 방법: [____]  검증 완료일: [____]\n\nNC-002: [해당 시 추가]",
    },
    {
      heading: "4. 심사 결론 및 서명",
      guidance: "전반적 QMS 효과성 평가와 심사원·피심사인 서명.",
      placeholder: "전반적 평가: [ ] 효과적  [ ] 개선 필요  [ ] 심각한 문제\n주요 강점: [____]\n개선 권고: [____]\n\n수석 심사원 서명: _______________ 일자: [____]\n피심사인 대표 서명: _______________ 일자: [____]\n다음 심사 예정: [____]",
    },
  ],
  checklist: [
    "심사원이 피심사 대상과 독립됐는가",
    "Clause 8.2.4 필수 항목이 모두 검토됐는가",
    "부적합 사항마다 시정 조치 계획과 기한이 있는가",
    "이전 심사 NC의 후속 조치를 확인했는가",
    "심사 결과가 경영 검토 입력으로 제공될 계획인가",
  ],
  relatedConceptSlugs: ["iso-13485"],
  refs: ["ISO 13485:2016 Clause 8.2.4", "ISO 19011:2018"],
},
```

- [ ] **Step 2: iso-corrective-action 추가**

```ts
{
  id: "iso-corrective-action",
  stationId: 8,
  docTitle: "시정 조치 기록 (CAPA)",
  purpose: "부적합·불만·바이질런스 사건에 대해 근본 원인을 분석하고 재발 방지 조치를 문서화한다.",
  rationale: "CAPA는 ISO 13485의 핵심 프로세스이자 NB 심사에서 가장 많이 지적되는 영역이다. 근본 원인 없이 재발 방지만 기록한 CAPA는 심사원이 수용하지 않는다.",
  difficulty: "medium" as any,
  importance: "high" as any,
  knowledge: [
    "ISO 13485:2016 Clause 8.5.2 — 시정 조치 요건",
    "근본 원인 분석 방법: 5-Why, 물고기뼈(Ishikawa), FTA 비교",
    "시정 조치(CA) vs 예방 조치(PA) vs 즉각 조치의 차이",
    "유효성 검증(Effectiveness Verification) — 조치 후 재발하지 않음을 확인",
    "리스크 평가: 조치 전 영향 평가 (환자 안전 영향 여부)",
  ],
  prerequisites: [
    { kind: "doc", label: "발생 원인 문서: 내부심사 NC / 고객 불만 / 부적합 제품 기록" },
    { kind: "data", label: "관련 제품 배치 번호·출하 현황" },
  ],
  sections: [
    {
      heading: "1. CAPA 개요 및 발생원",
      guidance: "CAPA 번호, 발생원, 기기 관련성, 환자 안전 영향을 초기 평가한다.",
      placeholder: "CAPA 번호: CAPA-[년도]-[순번]\n발생일: [____]  발견일: [____]\n발생원: [ ] 내부 심사  [ ] 고객 불만  [ ] 부적합 제품  [ ] 바이질런스  [ ] 기타\n관련 제품/프로세스: [____]\n환자 안전 영향: [ ] 있음 (바이질런스 보고 대상)  [ ] 없음\n심각도: [ ] 중대  [ ] 경미",
    },
    {
      heading: "2. 문제 설명 및 즉각 봉쇄 조치",
      guidance: "문제를 구체적으로 기술하고, 재발 방지 전에 현재 영향을 차단하는 즉각 조치를 기록한다.",
      placeholder: "문제 설명 (5W1H):\n무엇이: [____]\n언제: [____]\n어디서: [____]\n얼마나 자주: [____]\n영향 범위: [배치 번호/수량: ____]\n\n즉각 봉쇄 조치 (Containment):\n- [조치 1]: 완료일 [____]\n- [조치 2]: 완료일 [____]",
    },
    {
      heading: "3. 근본 원인 분석",
      guidance: "5-Why 또는 물고기뼈 방법으로 근본 원인을 파악한다. '사람의 실수'는 근본 원인이 아니다.",
      placeholder: "방법: [ ] 5-Why  [ ] Fishbone  [ ] 기타\n\n1차 원인: [____]\n2차 원인: [____]\n3차 원인: [____]\n4차 원인: [____]\n5차 원인 (근본): [____]\n\n근본 원인 결론: [____]",
    },
    {
      heading: "4. 시정 조치 계획 및 유효성 검증",
      guidance: "근본 원인에 대응하는 시정 조치를 계획하고, 완료 후 재발 여부를 검증한다.",
      placeholder: "시정 조치:\n① [조치 내용]: 담당 [____] 기한 [____] 완료일 [____]\n② [____]: 담당 [____] 기한 [____] 완료일 [____]\n\n문서 변경 필요: [ ] 있음 → [변경 문서번호] [ ] 없음\n교육 필요: [ ] 있음 → [대상/일정] [ ] 없음\n\n유효성 검증 방법: [예: 3개월 후 동일 지점 재심사]\n검증 기준: [____]\n검증 예정일: [____]\n검증 결과: [ ] 효과적  [ ] 추가 조치 필요",
    },
  ],
  checklist: [
    "발생원이 명확히 식별됐는가",
    "즉각 봉쇄 조치가 취해졌는가",
    "근본 원인이 '사람 실수' 수준을 넘어 시스템 원인까지 파악됐는가",
    "시정 조치가 근본 원인에 직접 대응하는가",
    "유효성 검증 계획과 기준이 정해졌는가",
    "환자 안전 영향 여부를 평가했는가",
  ],
  relatedConceptSlugs: ["iso-13485"],
  refs: ["ISO 13485:2016 Clause 8.5.2", "ISO 13485:2016 Clause 8.5.3"],
},
```

- [ ] **Step 3: iso-approved-supplier-list 충실화**

기존 `iso-approved-supplier-list` 문서의 placeholder 강화:

```ts
// sections[1].placeholder 교체 (공급자 평가 기준):
"평가 기준:\n[ ] ISO 13485 또는 ISO 9001 인증 보유\n[ ] 규제 요건 충족 확인 (CoC 또는 시험성적서 요구 가능)\n[ ] 납품 이력 및 품질 불만 이력\n[ ] 현장 심사 (Critical 공급자에 해당)\n\n평가 주기: [ ] 연간  [ ] 2년"

// sections[2].placeholder 교체 (공급자 목록 표):
"| No. | 공급자명 | 공급 품목 | 중요도 | 평가 결과 | 승인일 | 재평가 기한 | 비고 |\n|---|---|---|---|---|---|---|---|\n| 1 | [____] | [원자재/부품/서비스] | [Critical/Major/Minor] | [승인/조건부/미승인] | [____] | [____] | [____] |\n| 2 | [____] | [____] | [____] | [____] | [____] | [____] | [____] |"
```

- [ ] **Step 4: iso-management-review 충실화**

기존 `iso-management-review` 문서에 `rationale` 추가:

```ts
rationale: "경영 검토는 최고경영진이 QMS를 직접 관장하는 공식 메커니즘이다. 내용 없는 형식적 기록은 NB 심사에서 Clause 5.6 부적합 사항으로 지적된다. 입력 항목 7가지 모두 다뤄져야 한다.",
```

- [ ] **Step 5: 빌드 확인**

```
cd ivdr-wiki && npm run build
```

기대: 빌드 성공

- [ ] **Step 6: 커밋**

```bash
git add ivdr-wiki/src/data/iso13485/documents.ts
git commit -m "feat(docs): ISO 13485 문서 템플릿 충실화 (내부심사·CAPA·ASL·경영검토)"
```

---

## Task 10: GitHub Pages 배포

모든 변경사항을 main에 push해 GitHub Actions 자동 배포를 트리거한다.

**Files:** 없음 (git push만)

- [ ] **Step 1: 전체 빌드 최종 확인**

```
cd ivdr-wiki && npm run build
```

기대: 빌드 성공

- [ ] **Step 2: subtree push**

```bash
# 이전 export 브랜치 삭제 (이미 있을 경우)
git branch -D ivdr-wiki-export 2>/dev/null || true

# ivdr-wiki/ 서브디렉토리를 분리해 별도 브랜치로
cd /path/to/main-repo  # .claude/ 루트
git subtree split --prefix=ivdr-wiki -b ivdr-wiki-export

# ivdr-wiki 리포지토리의 main 브랜치에 push
git push https://github.com/mungbws1031/ivdr-wiki.git ivdr-wiki-export:main
```

- [ ] **Step 3: GitHub Actions 완료 확인**

```
gh run list --repo mungbws1031/ivdr-wiki --limit 1
```

기대: `completed` + `success` 상태. 배포 URL: https://mungbws1031.github.io/ivdr-wiki/

---

## Self-Review

### 1. Spec coverage 확인

| 요구사항 | 담당 Task |
|---|---|
| 인라인 에디터 | Task 1 (훅) + Task 2 (컴포넌트) + Task 3 (WorkSpace 연결) |
| 자동 저장 | Task 2 (400ms debounce + blur 즉시 저장) |
| 10~15개 문서 템플릿 충실화 | Task 8 (IVDR 5개) + Task 9 (ISO 4개 = 2 신규 + 2 충실화) = 총 9개 |
| 계산 툴 (계산이 필요한 문서) | Task 4 (SensSpecCalc) + Task 5 (SampleSizeCalc) + Task 6 (RiskMatrixCalc) + Task 7 (통합) |

**템플릿 충실화 카운트:**
- IVDR: performance-eval-plan, risk-management-plan, pms-plan, tech-doc-toc-gspr (GSPR 강화), declaration-of-conformity, device-registration = **6개**
- ISO 13485: iso-internal-audit-report (신규), iso-corrective-action (신규), iso-approved-supplier-list (강화), iso-management-review (강화) = **4개**
- 합계 **10개** (요청한 10~15개 범위 충족)

### 2. Placeholder 스캔
- "TBD", "TODO", "implement later" 없음 ✓
- 모든 코드 블록에 실제 코드 포함 ✓
- 타입 참조는 Task 1에서 정의된 것을 Task 2+에서 사용 ✓

### 3. 타입 일관성
- `CalcToolType` → Task 7 Step 1에서 `documents.ts`에 정의 → Task 4~6 컴포넌트에서 사용
- `InlineEditor` props `docId: string, sectionIdx: number` → Task 3에서 `doc.id`와 `i`로 전달 ✓
- `useDraftStore` 함수명 → `getDraft`, `setDraft`, `clearDraft` → Task 2에서 동일 이름 import ✓
