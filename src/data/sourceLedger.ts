// =====================================================================
// src/data/sourceLedger.ts
// 근거 원문 목록 — 이 허브가 인용하는 법령·규정·공식 양식을 한곳에 적은 장부예요.
//
// - cite: 코드·노트에 실제로 적혀 있는 판 번호 글자 그대로 (예: "제2026-58호").
//   sourceLedger.test.ts 가 usedIn 파일마다 이 글자가 있는지 검사해요.
//   그래서 한쪽에서만 판 번호를 바꾸면 테스트가 알려 줘요.
// - checked: 원문과 맞춰 본 날짜. 고시·법이 바뀌면 다시 확인하고 이 날짜를 고쳐요.
// - unverified: 아직 원문으로 확인하지 못한 부분. 화면에 "확인 필요"로 남아 있는 내용이에요.
// - 회사 내부 문서(절차서·양식)는 이 목록에 넣지 않아요.
// =====================================================================

export interface SourceEntry {
  id: string;
  /** 원문 이름 */
  title: string;
  /** 코드·노트에 적힌 판 번호 (글자 그대로) */
  cite: string;
  /** 시행·적용일 (공포일만 알면 그렇게 적음) */
  effective: string;
  /** 원문과 맞춰 본 날짜 (YYYY-MM-DD) */
  checked: string;
  /** 어디서 원문을 봤는지 */
  where: "국가법령정보센터" | "관보 OJ 원문" | "자료 폴더 PDF" | "자료 폴더 사본";
  /** 이 판 번호를 쓰는 파일 (저장소 기준 경로) */
  usedIn: string[];
  /** 아직 원문으로 확인하지 못한 부분 */
  unverified?: string[];
}

const CHECKED = "2026-11-05";

export const SOURCE_LEDGER: SourceEntry[] = [
  // ---------- 한국 ----------
  {
    id: "kr-review-notice",
    title: "체외진단의료기기 허가·신고·심사 등에 관한 규정 (식약처 고시)",
    cite: "제2026-58호",
    effective: "2026-08-10 시행",
    checked: CHECKED,
    where: "국가법령정보센터",
    usedIn: ["src/data/documents.ts", "src/lib/kr/index.ts", "content/wiki/kr-ivd-law-structure.md"],
  },
  {
    id: "kr-ivd-rule",
    title: "체외진단의료기기법 시행규칙 (총리령)",
    cite: "총리령 제2155호",
    effective: "2026-09-18 시행",
    checked: CHECKED,
    where: "국가법령정보센터",
    usedIn: ["src/data/documents.ts", "src/lib/kr/index.ts", "content/wiki/kr-ivd-law-structure.md"],
    unverified: ["부작용 보고 기한과 서식", "임상적 성능시험 계획서 항목과 동의 방법"],
  },
  {
    id: "kr-grade-notice",
    title: "체외진단의료기기 품목 및 품목별 등급에 관한 규정 (식약처 고시)",
    cite: "제2026-45호",
    effective: "2026-06-30",
    checked: CHECKED,
    where: "국가법령정보센터",
    usedIn: ["src/lib/kr/index.ts", "content/wiki/kr-ivd-law-structure.md"],
  },
  {
    id: "kr-ivd-act",
    title: "체외진단의료기기법 (현행)",
    cite: "법률 제21525호",
    effective: "2026-10-08 시행",
    checked: CHECKED,
    where: "국가법령정보센터",
    usedIn: [
      "src/data/documents.ts",
      "content/wiki/kr-clinical-performance.md",
      "content/wiki/kr-digital-medical-products.md",
      "content/wiki/kr-ivd-law-structure.md",
    ],
  },
  {
    id: "kr-ivd-act-enacted",
    title: "체외진단의료기기법 (제정)",
    cite: "법률 제16433호",
    effective: "2019-04-30 공포, 공포 1년 뒤 시행",
    checked: CHECKED,
    where: "국가법령정보센터",
    usedIn: ["content/wiki/kr-ivd-law-structure.md", "content/wiki/kr-regulatory-history.md"],
  },
  {
    id: "kr-md-act",
    title: "의료기기법 (현행)",
    cite: "법률 제22105호",
    effective: "2026-10-20 시행",
    checked: CHECKED,
    where: "국가법령정보센터",
    usedIn: ["src/data/documents.ts", "src/lib/kr/index.ts", "content/wiki/kr-ivd-law-structure.md"],
  },
  {
    id: "kr-digital-act",
    title: "디지털의료제품법 (제정)",
    cite: "법률 제20139호",
    effective: "2024-01-23 공포, 공포 1년 뒤 시행 (제33조~제35조는 공포 2년 뒤)",
    checked: CHECKED,
    where: "국가법령정보센터",
    usedIn: ["content/wiki/kr-digital-medical-products.md"],
  },
  {
    id: "kr-digital-grade-notice",
    title: "디지털의료제품 분류 및 등급 지정 고시 (식약처 고시)",
    cite: "제2025-23호",
    effective: "원문 확인 필요",
    checked: CHECKED,
    where: "국가법령정보센터",
    usedIn: ["content/wiki/kr-digital-medical-products.md"],
    unverified: ["고시 원문과 아직 맞춰 보지 않았어요 (체외진단 소프트웨어 품목이 옮겨 갔다는 안내만 있음)"],
  },

  // ---------- EU ----------
  {
    id: "eu-ppwr",
    title: "EU 포장·포장폐기물 규정 (PPWR)",
    cite: "Regulation (EU) 2025/40",
    effective: "관보 OJ L 2025.1.22 게재, 2026-08-12 적용",
    checked: CHECKED,
    where: "관보 OJ 원문",
    usedIn: ["src/data/documents.ts", "src/lib/transport/packaging.ts", "src/lib/transport/standards.ts"],
    unverified: [
      "날짜를 정할 위임법·시행법이 나왔는지",
      "IVD 접촉 민감 포장 예외가 키트 상자·출하 박스까지 미치는지 (원문만으로 해석이 갈림)",
    ],
  },
  {
    id: "eu-ehds",
    title: "유럽건강데이터공간 규정 (EHDS)",
    cite: "Regulation (EU) 2025/327",
    effective: "관보 OJ L 2025.3.5 게재, 2027-03-26 적용 (제27조는 2029-03-26 또는 2031-03-26)",
    checked: CHECKED,
    where: "자료 폴더 PDF",
    usedIn: ["content/wiki/mdsw.md"],
  },
  {
    id: "eu-mir",
    title: "유럽위원회 MIR(제조자 사고 보고) 양식 도움말",
    cite: "Help text 7.2",
    effective: "자료 폴더 사본은 양식 7.2.1판",
    checked: CHECKED,
    where: "자료 폴더 사본",
    usedIn: ["content/wiki/vigilance.md"],
    unverified: ["유럽위원회 사이트의 최신 판 번호"],
  },
  {
    id: "eu-fsn-qa",
    title: "FSN(현장안전 공지) 작성 Q&A",
    cite: "Q&A: FSN, 2018년 9월",
    effective: "2018년 9월판",
    checked: CHECKED,
    where: "자료 폴더 사본",
    usedIn: ["content/wiki/vigilance.md"],
  },
];

/** 아직 어느 원문으로도 확인하지 못한 주제 (특정 판 번호에 매이지 않은 것) */
export const OPEN_SOURCE_QUESTIONS: string[] = [
  "1등급 체외진단의료기기의 KGMP(제조·품질관리기준) 적용 범위",
  "의료기기 표시·기재 고시가 체외진단의료기기에 어디까지 적용되는지",
  "자가검사용 '보조검사용' 문구가 언제부터 의무인지",
];
