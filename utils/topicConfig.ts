import {
  Briefcase,
  Plane,
  Coffee,
  Heart,
  Monitor,
  Stethoscope,
  ShoppingBag,
  Music,
  TreePine,
  Banknote,
  Gavel,
  GraduationCap,
  Dumbbell,
  Globe,
} from 'lucide-react';

interface TopicConfig {
  icon: typeof Globe;
  color: string;
  bg: string;
  border: string;
}

const TOPIC_MATCHERS: {keywords: string[]; config: TopicConfig}[] = [
  {
    keywords: ['business', 'work'],
    config: {
      icon: Briefcase,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
    },
  },
  {
    keywords: ['travel', 'survival'],
    config: {icon: Plane, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30'},
  },
  {
    keywords: ['food', 'dining'],
    config: {
      icon: Coffee,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
    },
  },
  {
    keywords: ['social', 'love'],
    config: {
      icon: Heart,
      color: 'text-pink-400',
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/30',
    },
  },
  {
    keywords: ['tech'],
    config: {
      icon: Monitor,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
    },
  },
  {
    keywords: ['medical'],
    config: {
      icon: Stethoscope,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
    },
  },
  {
    keywords: ['shopping'],
    config: {
      icon: ShoppingBag,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/30',
    },
  },
  {
    keywords: ['music', 'entertainment'],
    config: {
      icon: Music,
      color: 'text-fuchsia-400',
      bg: 'bg-fuchsia-500/10',
      border: 'border-fuchsia-500/30',
    },
  },
  {
    keywords: ['environment'],
    config: {
      icon: TreePine,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
    },
  },
  {
    keywords: ['finance'],
    config: {
      icon: Banknote,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
    },
  },
  {
    keywords: ['legal'],
    config: {
      icon: Gavel,
      color: 'text-slate-400',
      bg: 'bg-slate-500/10',
      border: 'border-slate-500/30',
    },
  },
  {
    keywords: ['education'],
    config: {
      icon: GraduationCap,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
    },
  },
  {
    keywords: ['sport'],
    config: {
      icon: Dumbbell,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
    },
  },
];

const DEFAULT_TOPIC_CONFIG: TopicConfig = {
  icon: Globe,
  color: 'text-brand-400',
  bg: 'bg-brand-500/10',
  border: 'border-brand-500/30',
};

export const getTopicConfig = (topic: string): TopicConfig => {
  const t = topic.toLowerCase();
  return (
    TOPIC_MATCHERS.find((m) => m.keywords.some((k) => t.includes(k)))?.config ??
    DEFAULT_TOPIC_CONFIG
  );
};

const DIFFICULTY_COLORS: Record<string, string> = {
  'A1-A2': 'bg-emerald-500 text-white shadow-emerald-500/20',
  'B1-B2': 'bg-amber-500 text-white shadow-amber-500/20',
};

const DEFAULT_DIFFICULTY_COLOR = 'bg-rose-500 text-white shadow-rose-500/20';

export const getDifficultyColor = (level: string): string =>
  DIFFICULTY_COLORS[level] ?? DEFAULT_DIFFICULTY_COLOR;
