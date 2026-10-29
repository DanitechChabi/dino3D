import { Baby, Flame, Flower2, Shield, Music, Globe, Heart, BookOpen, Users, HandHeart, type LucideIcon } from "lucide-react";

export const MINISTRY_ICONS: Record<string, LucideIcon> = {
  baby: Baby,
  flame: Flame,
  flower: Flower2,
  shield: Shield,
  music: Music,
  globe: Globe,
  heart: Heart,
  book: BookOpen,
  users: Users,
  hands: HandHeart,
};

export function MinistryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = MINISTRY_ICONS[name] ?? Heart;
  return <Icon className={className} />;
}
