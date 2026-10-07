import { BookOpen, Clock, Flame, FlaskConical, GraduationCap, Sprout, type LucideProps } from "lucide-react";
import type { MilestoneIcon as IconName } from "@/lib/engine/milestones";

const ICONS = { BookOpen, Clock, Flame, FlaskConical, GraduationCap, Sprout };

export function MilestoneIcon({ name, ...props }: { name: IconName } & LucideProps) {
  const Icon = ICONS[name];
  return <Icon aria-hidden {...props} />;
}
