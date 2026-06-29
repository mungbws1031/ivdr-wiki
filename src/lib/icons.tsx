import {
  Activity,
  BadgeCheck,
  Database,
  FileText,
  GitFork,
  Layers,
  Repeat,
  Route,
  ShieldAlert,
  Stamp,
  Target,
  type LucideIcon,
} from "lucide-react";

/** stations.ts 의 kebab 아이콘 이름 → lucide 컴포넌트 매핑. */
const REGISTRY: Record<string, LucideIcon> = {
  target: Target,
  "git-fork": GitFork,
  route: Route,
  layers: Layers,
  "file-text": FileText,
  activity: Activity,
  "shield-alert": ShieldAlert,
  "badge-check": BadgeCheck,
  stamp: Stamp,
  database: Database,
  repeat: Repeat,
};

export function getIcon(name: string): LucideIcon {
  return REGISTRY[name] ?? Target;
}
