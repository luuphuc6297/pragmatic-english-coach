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
  selectedClass?: string;
}

const TOPIC_MATCHERS: {keywords: string[]; config: TopicConfig}[] = [
  {
    keywords: ['business', 'work'],
    config: {
      icon: Briefcase,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      selectedClass: 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/25 scale-105',
    },
  },
  {
    keywords: ['travel', 'survival'],
    config: {
      icon: Plane, 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-500/10', 
      border: 'border-emerald-500/30',
      selectedClass: 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25 scale-105',
    },
  },
  {
    keywords: ['food', 'dining'],
    config: {
      icon: Coffee,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      selectedClass: 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/25 scale-105',
    },
  },
  {
    keywords: ['social', 'love'],
    config: {
      icon: Heart,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      selectedClass: 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/25 scale-105',
    },
  },
  {
    keywords: ['tech'],
    config: {
      icon: Monitor,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/30',
      selectedClass: 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/25 scale-105',
    },
  },
  {
    keywords: ['medical'],
    config: {
      icon: Stethoscope,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      selectedClass: 'bg-cyan-500 text-white border-cyan-500 shadow-lg shadow-cyan-500/25 scale-105',
    },
  },
  {
    keywords: ['shopping'],
    config: {
      icon: ShoppingBag,
      color: 'text-pink-400',
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/30',
      selectedClass: 'bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-500/25 scale-105',
    },
  },
  {
    keywords: ['music', 'entertainment'],
    config: {
      icon: Music,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/30',
      selectedClass: 'bg-violet-500 text-white border-violet-500 shadow-lg shadow-violet-500/25 scale-105',
    },
  },
  {
    keywords: ['environment'],
    config: {
      icon: TreePine,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      selectedClass: 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/25 scale-105',
    },
  },
  {
    keywords: ['finance'],
    config: {
      icon: Banknote,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      selectedClass: 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25 scale-105',
    },
  },
  {
    keywords: ['legal'],
    config: {
      icon: Gavel,
      color: 'text-slate-400',
      bg: 'bg-slate-500/10',
      border: 'border-slate-500/30',
      selectedClass: 'bg-slate-500 text-white border-slate-500 shadow-lg shadow-slate-500/25 scale-105',
    },
  },
  {
    keywords: ['education'],
    config: {
      icon: GraduationCap,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      selectedClass: 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/25 scale-105',
    },
  },
  {
    keywords: ['sport'],
    config: {
      icon: Dumbbell,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      selectedClass: 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/25 scale-105',
    },
  },
];

const DEFAULT_TOPIC_CONFIG: TopicConfig = {
  icon: Globe,
  color: 'text-slate-400',
  bg: 'bg-slate-500/10',
  border: 'border-slate-500/30',
  selectedClass: 'bg-slate-500 text-white border-slate-500 shadow-lg shadow-slate-500/25 scale-105',
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
