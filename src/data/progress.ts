// ivdr-wiki/src/data/progress.ts
import { useState, useCallback } from "react";

export type DocStatus = "not_started" | "in_progress" | "done";
type ProgressMap = Record<string, DocStatus>;

const storageKey = (certId: string) => `cert-progress-${certId}`;

function loadProgress(certId: string): ProgressMap {
  try {
    return JSON.parse(localStorage.getItem(storageKey(certId)) ?? "{}");
  } catch {
    return {};
  }
}

function saveProgress(certId: string, map: ProgressMap) {
  localStorage.setItem(storageKey(certId), JSON.stringify(map));
}

export function useProgress(certId: "ivdr" | "iso13485") {
  const [progress, setProgress] = useState<ProgressMap>(() => loadProgress(certId));

  const setStatus = useCallback(
    (docId: string, status: DocStatus) => {
      setProgress((prev) => {
        const next = { ...prev, [docId]: status };
        saveProgress(certId, next);
        return next;
      });
    },
    [certId],
  );

  const getStatus = useCallback(
    (docId: string): DocStatus => progress[docId] ?? "not_started",
    [progress],
  );

  const countByStatus = useCallback(
    (docIds: string[]) => {
      let done = 0, inProgress = 0;
      for (const id of docIds) {
        const s = progress[id] ?? "not_started";
        if (s === "done") done++;
        else if (s === "in_progress") inProgress++;
      }
      return { done, inProgress, total: docIds.length };
    },
    [progress],
  );

  return { getStatus, setStatus, countByStatus };
}

export const STATUS_LABEL: Record<DocStatus, string> = {
  not_started: "미작성",
  in_progress: "작성 중",
  done: "완료",
};

export const STATUS_NEXT: Record<DocStatus, DocStatus> = {
  not_started: "in_progress",
  in_progress: "done",
  done: "not_started",
};

export const STATUS_COLOR: Record<DocStatus, string> = {
  not_started: "var(--text-subtle)",
  in_progress: "var(--warning)",
  done: "var(--success)",
};
