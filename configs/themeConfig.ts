import {
  BookOpen,
  BrainCircuit,
  Briefcase,
  Coffee,
  Languages,
  MessageCircle,
  MessageSquareQuote,
  Network,
  Smile,
  Users,
} from 'lucide-react';
import {ChatMode} from '../types';

// ─── DESIGN TOKENS ──────────────────────────────────────────

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// ─── STYLES (Component-Level Design System) ─────────────────

export const styles = {
  // ── Modal ──────────────────────────────────────────────
  modal: {
    overlay: 'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200',
    container: 'bg-white rounded-2xl shadow-2xl w-full overflow-hidden flex flex-col',
    containerLg: 'bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]',
    header: 'px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50',
    headerTitle: 'text-xl font-bold text-slate-800 flex items-center gap-2',
    content: 'p-6 overflow-y-auto custom-scrollbar flex-1',
    footer: 'px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center gap-3',
  },

  // ── Button ─────────────────────────────────────────────
  button: {
    primary: 'px-5 py-2.5 rounded-xl font-bold bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all active:scale-95',
    secondary: 'px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors',
    danger: 'px-5 py-3 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 transition-colors shadow-md shadow-rose-500/20',
    ghost: 'p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500',
    ghostDark: 'p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors',
    icon: 'p-2 text-slate-400 hover:text-brand-600 transition-colors',
    pill: 'flex items-center gap-2 text-sm font-bold bg-slate-800 px-4 py-2 rounded-full border border-slate-700 hover:border-slate-500 transition-all',
    pillActive: 'bg-white shadow-sm ring-1 ring-slate-200/50',
    pillInactive: 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50',
    fullWidth: 'w-full py-3 px-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2',
  },

  // ── Card ───────────────────────────────────────────────
  card: {
    dark: 'bg-slate-800 rounded-2xl p-6 border border-slate-700',
    darkTranslucent: 'bg-slate-800/50 rounded-2xl border border-slate-700',
    darkInteractive: 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-2xl transition-all duration-300 hover:scale-[1.02]',
    light: 'bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all',
    stat: 'p-4 rounded-2xl border flex flex-col items-center',
    interactive: 'bg-white border border-slate-200 rounded-2xl p-4 hover:border-brand-300 hover:shadow-md transition-all group cursor-pointer',
  },

  // ── Input ──────────────────────────────────────────────
  input: {
    light: 'w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all',
    dark: 'w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all',
    focus: 'focus:ring-2 focus:ring-brand-100 focus:border-brand-500',
    chatContainer: 'flex items-center gap-2 bg-slate-100 p-1.5 rounded-[2rem] border border-transparent focus-within:border-slate-200 focus-within:ring-2 focus-within:bg-white transition-all shadow-sm',
  },

  // ── Badge ──────────────────────────────────────────────
  badge: {
    base: 'px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider',
    active: 'bg-brand-500 text-white shadow-sm',
    inactive: 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50',
    status: 'px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider',
    info: 'text-[10px] font-bold uppercase px-2 py-1 rounded-md',
  },

  // ── Text ───────────────────────────────────────────────
  text: {
    heading: 'text-xl font-bold text-slate-800',
    headingLg: 'text-3xl font-bold text-slate-800',
    subheading: 'text-sm text-slate-500',
    label: 'text-xs font-bold text-slate-400 uppercase tracking-wider',
    labelWide: 'text-xs font-bold text-slate-400 uppercase tracking-widest',
    sectionLabel: 'text-sm font-bold text-slate-700 uppercase tracking-wider',
    muted: 'text-slate-400',
    inverse: 'text-white',
  },

  // ── Layout ─────────────────────────────────────────────
  layout: {
    screenDark: 'h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white gap-4',
    screenLight: 'h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4',
    pageDark: 'flex flex-col items-center justify-center min-h-screen bg-slate-900 p-6 text-white relative overflow-hidden',
    gradientBg: 'absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.15),transparent)] pointer-events-none',
    mobileHeader: 'md:hidden h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-10',
  },

  // ── Popover ────────────────────────────────────────────
  popover: 'fixed z-50 bg-slate-900 text-white px-3 py-2 rounded-lg shadow-xl',

  // ── Tooltip ────────────────────────────────────────────
  tooltip: 'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-xs p-3 rounded-xl opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-10 shadow-xl',

  // ── Transition ─────────────────────────────────────────
  transition: {
    fast: 'transition-all duration-200',
    normal: 'transition-all duration-300',
    slow: 'transition-all duration-500',
    colors: 'transition-colors',
  },

  // ── Hint ───────────────────────────────────────────────
  hint: {
    container: 'flex flex-col gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-100 transition-all duration-300',
    label: 'text-xs font-semibold text-yellow-700 uppercase tracking-wider flex items-center gap-2',
    pillButton: 'flex items-center px-3 py-1.5 text-xs font-medium rounded-full transition-colors',
    item: 'text-sm text-slate-700 animate-in fade-in slide-in-from-top-2 p-2 bg-white/60 rounded-lg border border-yellow-100/50',
  },

  // ── Sidebar ────────────────────────────────────────────
  sidebar: {
    container: 'flex flex-col bg-slate-950 border-r border-slate-800 transition-all duration-300 overflow-hidden absolute md:relative z-50 h-full',
    header: 'h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0',
    historyItem: 'w-full text-left p-3 rounded-xl transition-colors flex flex-col',
    historyItemActive: 'bg-slate-800 border border-slate-700',
    historyItemInactive: 'hover:bg-slate-800/50 border border-transparent',
  },
} as const;

// ─── SCORE & MASTERY ────────────────────────────────────────

export const SCORE_THRESHOLDS = {
  HIGH: 8,
  MEDIUM: 5,
} as const;

export const MASTERY_THRESHOLDS = {
  HIGH: 80,
  MEDIUM: 50,
} as const;

export const getScoreColorClass = (score: number) => {
  if (score >= SCORE_THRESHOLDS.HIGH) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
  if (score >= SCORE_THRESHOLDS.MEDIUM) return 'bg-amber-50 text-amber-600 border-amber-100';
  return 'bg-rose-50 text-rose-600 border-rose-100';
};

export const getScoreBadgeClass = (score: number) => {
  if (score >= SCORE_THRESHOLDS.HIGH) return 'bg-emerald-100 text-emerald-700';
  if (score >= SCORE_THRESHOLDS.MEDIUM) return 'bg-amber-100 text-amber-700';
  return 'bg-rose-100 text-rose-700';
};

export const getScoreBadgeLabel = (score: number) => {
  if (score >= SCORE_THRESHOLDS.HIGH) return 'Excellent';
  if (score >= SCORE_THRESHOLDS.MEDIUM) return 'Good Effort';
  return 'Improvement Needed';
};

export const getMasteryBarClass = (masteryScore: number) => {
  if (masteryScore >= MASTERY_THRESHOLDS.HIGH) return 'bg-emerald-500';
  if (masteryScore >= MASTERY_THRESHOLDS.MEDIUM) return 'bg-amber-500';
  return 'bg-rose-500';
};

// ─── TONE VARIATIONS ────────────────────────────────────────

export const TONE_VARIATIONS = [
  {
    key: 'formal',
    icon: Briefcase,
    color: 'text-indigo-600',
    bg: 'hover:border-indigo-200 hover:bg-indigo-50',
    label: 'Formal',
  },
  {
    key: 'conversational',
    icon: MessageCircle,
    color: 'text-emerald-600',
    bg: 'hover:border-emerald-200 hover:bg-emerald-50',
    label: 'Neutral',
  },
  {
    key: 'friendly',
    icon: Smile,
    color: 'text-amber-600',
    bg: 'hover:border-amber-200 hover:bg-amber-50',
    label: 'Friendly',
  },
  {
    key: 'informal',
    icon: Coffee,
    color: 'text-pink-600',
    bg: 'hover:border-pink-200 hover:bg-pink-50',
    label: 'Casual',
  },
] as const;

// ─── MODE CARDS ─────────────────────────────────────────────

interface ModeCardConfig {
  mode: ChatMode;
  icon: typeof MessageSquareQuote;
  title: string;
  description: string;
  borderHover: string;
  iconBg: string;
  iconHover: string;
  ctaColor: string;
}

export const MODE_CARDS: ModeCardConfig[] = [
  {
    mode: 'roleplay',
    icon: MessageSquareQuote,
    title: 'Scenario Coach',
    description:
      'Practice specific situations (e.g., "Ordering Coffee") with AI grading your grammar and naturalness.',
    borderHover: 'hover:border-brand-500',
    iconBg: 'bg-brand-500/20 text-brand-400',
    iconHover: 'group-hover:bg-brand-500',
    ctaColor: 'text-brand-400',
  },
  {
    mode: 'story',
    icon: BookOpen,
    title: 'Story Mode',
    description:
      'Choose a scenario or describe your own to practice conversational skills. The AI adapts to your replies dynamically.',
    borderHover: 'hover:border-purple-500',
    iconBg: 'bg-purple-500/20 text-purple-400',
    iconHover: 'group-hover:bg-purple-500',
    ctaColor: 'text-purple-400',
  },
  {
    mode: 'translator',
    icon: Languages,
    title: 'Tone Translator',
    description:
      'Input any sentence and see it transformed into Formal, Friendly, Informal, and Native tones.',
    borderHover: 'hover:border-indigo-500',
    iconBg: 'bg-indigo-500/20 text-indigo-400',
    iconHover: 'group-hover:bg-indigo-500',
    ctaColor: 'text-indigo-400',
  },
  {
    mode: 'quiz',
    icon: BrainCircuit,
    title: 'Vocab Quiz',
    description: "Test your memory on the vocabulary and grammar items you've saved.",
    borderHover: 'hover:border-amber-500',
    iconBg: 'bg-amber-500/20 text-amber-400',
    iconHover: 'group-hover:bg-amber-500',
    ctaColor: 'text-amber-400',
  },
  {
    mode: 'vocab_hub',
    icon: Network,
    title: 'Vocab Hub',
    description:
      'Master vocabulary through morphological breakdown, contextual embedding, and interactive mind maps.',
    borderHover: 'hover:border-emerald-500',
    iconBg: 'bg-emerald-500/20 text-emerald-400',
    iconHover: 'group-hover:bg-emerald-500',
    ctaColor: 'text-emerald-400',
  },
  {
    mode: 'live',
    icon: Users,
    title: 'Live Conversation',
    description: 'Practice natural, real-time voice conversations with an AI English coach.',
    borderHover: 'hover:border-rose-500',
    iconBg: 'bg-rose-500/20 text-rose-400',
    iconHover: 'group-hover:bg-rose-500',
    ctaColor: 'text-rose-400',
  },
];
