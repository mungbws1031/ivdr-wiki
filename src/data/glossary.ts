// 약어·규정 용어 한 줄 풀이 (U-7). 정의 수준만 쓰고 수치·조항 세부는 넣지 않는다.
// slug는 개념 위키(concepts.ts)에 있는 것만.

export interface GlossaryEntry {
  term: string;
  short: string;
  slug?: string;
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  NB: { term: "NB (인증기관, Notified Body)", short: "EU가 지정한 민간 심사 기관. Class B 이상은 이 기관의 심사를 받아야 CE 마크를 붙인다.", slug: "notified-body" },
  GSPR: { term: "GSPR (일반 안전·성능 요구사항)", short: "IVDR Annex I에 있는 안전·성능 요구사항 목록. 조항마다 어떻게 충족했는지 근거를 남긴다.", slug: "gspr" },
  PEP: { term: "PEP·PER (성능평가 계획·보고서)", short: "과학적 타당성·분석 성능·임상 성능을 어떻게 보일지 계획하고 결과를 정리한 문서.", slug: "pep-per" },
  PMS: { term: "PMS (시판 후 감시)", short: "판매 후 제품 성능·안전 정보를 계속 모으고 검토하는 활동.", slug: "pms" },
  PSUR: { term: "PSUR (정기 안전성 보고서)", short: "Class C·D 제품의 시판 후 감시 결과를 정기적으로 정리한 보고서.", slug: "pms" },
  SSP: { term: "SSP (안전·성능 요약)", short: "Class C·D 제품에 대해 공개하는 안전·성능 요약 문서.", slug: "ssp" },
  UDI: { term: "UDI (기기 고유 식별자)", short: "제품을 추적하기 위해 라벨에 넣는 표준 식별 코드.", slug: "udi" },
  EUDAMED: { term: "EUDAMED", short: "EU 의료기기 데이터베이스. 제조자·기기·인증서 정보를 등록한다.", slug: "eudamed" },
  "Annex VIII": { term: "Annex VIII (분류 규칙)", short: "IVDR에서 Class A~D를 정하는 Rule 1~7이 있는 부속서.", slug: "annex-viii" },
  "Annex IX": { term: "Annex IX (적합성 평가)", short: "품질경영시스템 심사와 기술문서 평가로 적합성을 보이는 경로를 정한 부속서." },
  "Rule 4(a)": { term: "Rule 4(a) (자가검사)", short: "일반인 자가검사 기기 분류 규칙. 원칙은 Class C이고, 임신·가임력 등 일부 품목은 예외로 B다.", slug: "annex-viii" },
  CE: { term: "CE 마크", short: "EU 규정에 적합하다는 표시. 붙여야 EU에서 판매할 수 있다.", slug: "ce-marking" },
  IFU: { term: "IFU (사용설명서)", short: "사용자가 검사 방법·결과 판독·주의사항을 확인하는 설명서.", slug: "ifu" },
  PRRC: { term: "PRRC (규정 준수 책임자)", short: "제조자가 두어야 하는 규정 준수 책임자.", slug: "prrc" },
  KGMP: { term: "KGMP (의료기기 제조·품질관리 기준)", short: "국내 의료기기 제조·품질관리 기준. 식약처 적합인정을 받는다." },
  QMSR: { term: "QMSR (미국 품질관리 규정)", short: "미국 FDA의 의료기기 품질시스템 규정(21 CFR 820). ISO 13485를 바탕으로 한다." },
  CLIA: { term: "CLIA", short: "미국 검사실 검사 규정. 검사 난이도에 따라 waived·moderate·high로 나뉜다." },
  "510(k)": { term: "510(k)", short: "이미 판매 중인 비교 기기와 실질적으로 같음을 보여 FDA 판매 허가를 받는 경로." },
  "De Novo": { term: "De Novo", short: "비교할 기존 기기가 없는 저·중위험 새 기기를 FDA에 분류 요청하는 경로." },
  LoD: { term: "LoD (검출 한계)", short: "검사가 안정적으로 검출할 수 있는 가장 낮은 농도." },
  "ISO 13485": { term: "ISO 13485", short: "의료기기 품질경영시스템 국제 표준.", slug: "iso-13485" },
  MDSAP: { term: "MDSAP", short: "여러 나라 규제기관이 함께 인정하는 품질경영시스템 단일 심사 프로그램.", slug: "mdsap" },
};
