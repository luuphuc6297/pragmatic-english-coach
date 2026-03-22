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
    overlay: 'fixed inset-0 z-50 bg-navy/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200',
    container: 'bg-navy border border-glassBorder rounded-twelve shadow-2xl w-full overflow-hidden flex flex-col',
    containerLg: 'bg-navy border border-glassBorder w-full max-w-2xl rounded-twelve shadow-2xl overflow-hidden flex flex-col max-h-[90vh]',
    header: 'px-6 py-4 border-b border-glassBorder flex items-center justify-between bg-navy',
    headerTitle: 'text-xl font-bold text-white flex items-center gap-2',
    content: 'p-6 overflow-y-auto custom-scrollbar flex-1 text-slate-300',
    footer: 'px-6 py-4 bg-navy border-t border-glassBorder flex justify-between items-center gap-3',
  },

  // ── Button ─────────────────────────────────────────────
  button: {
    primary: 'px-5 py-2.5 rounded-twelve font-bold bg-tealAccent text-navy hover:bg-tealAccent/90 transition-all active:scale-95 glow-teal',
    secondary: 'px-5 py-2.5 rounded-twelve font-bold border border-purpleAccent text-purpleAccent hover:bg-purpleAccent/10 transition-colors',
    danger: 'px-5 py-3 rounded-twelve font-bold text-white bg-rose-500 hover:bg-rose-600 transition-colors shadow-md shadow-rose-500/20',
    ghost: 'p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300',
    ghostDark: 'p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors',
    icon: 'p-2 text-slate-400 hover:text-tealAccent transition-colors',
    pill: 'flex items-center gap-2 text-sm font-bold bg-glassBg px-4 py-2 rounded-full border border-glassBorder hover:border-slate-500 transition-all text-slate-300',
    pillActive: 'bg-tealAccent text-navy shadow-sm ring-1 ring-tealAccent/50',
    pillInactive: 'text-slate-400 hover:text-white hover:bg-white/10',
    fullWidth: 'w-full py-3 px-4 rounded-twelve font-bold transition-colors flex items-center justify-center gap-2',
  },

  // ── Card ───────────────────────────────────────────────
  card: {
    dark: 'glass-card p-6',
    darkTranslucent: 'glass-card',
    darkInteractive: 'glass-card transition-all duration-300 hover:scale-[1.02] hover:bg-white/5',
    light: 'glass-card p-4 hover:shadow-md transition-all',
    stat: 'p-4 rounded-twelve border border-glassBorder flex flex-col items-center bg-glassBg',
    interactive: 'glass-card p-4 hover:border-tealAccent hover:shadow-md transition-all group cursor-pointer',
  },

  // ── Input ──────────────────────────────────────────────
  input: {
    light: 'w-full px-4 py-3 rounded-twelve bg-navy border border-glassBorder text-white focus:border-tealAccent focus:ring-2 focus:ring-tealAccent/20 outline-none transition-all',
    dark: 'w-full px-4 py-3 bg-navy border border-glassBorder rounded-twelve text-white placeholder-slate-500 focus:border-tealAccent focus:ring-1 focus:ring-tealAccent outline-none transition-all',
    focus: 'focus:ring-2 focus:ring-tealAccent/20 focus:border-tealAccent',
    chatContainer: 'flex items-center gap-2 bg-navy p-1.5 rounded-[2rem] border border-glassBorder focus-within:border-tealAccent focus-within:ring-2 focus-within:bg-navy transition-all shadow-sm',
  },

  // ── Badge ──────────────────────────────────────────────
  badge: {
    base: 'px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider',
    active: 'bg-tealAccent text-navy shadow-sm',
    inactive: 'bg-glassBg text-slate-400 border border-glassBorder hover:bg-white/10',
    status: 'px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider',
    info: 'text-[10px] font-bold uppercase px-2 py-1 rounded-md',
  },

  // ── Text ───────────────────────────────────────────────
  text: {
    heading: 'text-xl font-bold text-white',
    headingLg: 'text-3xl font-bold text-white',
    subheading: 'text-sm text-slate-400',
    label: 'text-xs font-bold text-slate-400 uppercase tracking-wider',
    labelWide: 'text-xs font-bold text-slate-400 uppercase tracking-widest',
    sectionLabel: 'text-sm font-bold text-slate-300 uppercase tracking-wider',
    muted: 'text-slate-400',
    inverse: 'text-navy',
  },

  // ── Layout ─────────────────────────────────────────────
  layout: {
    screenDark: 'h-screen w-full flex flex-col items-center justify-center bg-navy text-white gap-4',
    screenLight: 'h-screen w-full flex flex-col items-center justify-center bg-navy text-white gap-4',
    pageDark: 'flex flex-col items-center justify-center min-h-screen bg-navy p-6 text-white relative overflow-hidden',
    gradientBg: 'absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(78,217,204,0.15),transparent)] pointer-events-none',
    mobileHeader: 'md:hidden h-14 bg-navy border-b border-glassBorder flex items-center justify-between px-4 sticky top-0 z-10',
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
    container: 'flex flex-col bg-navy border-r border-glassBorder transition-all duration-300 overflow-hidden absolute md:relative z-50 h-full',
    header: 'h-16 flex items-center justify-between px-4 border-b border-glassBorder shrink-0',
    historyItem: 'w-full text-left p-3 rounded-twelve transition-colors flex flex-col',
    historyItemActive: 'glass-card',
    historyItemInactive: 'hover:bg-white/5 border border-transparent',
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
  if (score >= SCORE_THRESHOLDS.HIGH) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  if (score >= SCORE_THRESHOLDS.MEDIUM) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
};

export const getScoreBadgeClass = (score: number) => {
  if (score >= SCORE_THRESHOLDS.HIGH) return 'bg-emerald-500/20 text-emerald-300';
  if (score >= SCORE_THRESHOLDS.MEDIUM) return 'bg-amber-500/20 text-amber-300';
  return 'bg-rose-500/20 text-rose-300';
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
    color: 'text-indigo-400',
    bg: 'hover:border-indigo-500/30 hover:bg-indigo-500/10',
    label: 'Formal',
  },
  {
    key: 'conversational',
    icon: MessageCircle,
    color: 'text-emerald-400',
    bg: 'hover:border-emerald-500/30 hover:bg-emerald-500/10',
    label: 'Neutral',
  },
  {
    key: 'friendly',
    icon: Smile,
    color: 'text-amber-400',
    bg: 'hover:border-amber-500/30 hover:bg-amber-500/10',
    label: 'Friendly',
  },
  {
    key: 'informal',
    icon: Coffee,
    color: 'text-pink-400',
    bg: 'hover:border-pink-500/30 hover:bg-pink-500/10',
    label: 'Casual',
  },
] as const;

// ─── MODE CARDS ─────────────────────────────────────────────

interface ModeCardConfig {
  mode: ChatMode;
  icon: React.ElementType | string;
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
    icon: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Trophy.png',
    title: 'Scenario Coach',
    description:
      'Practice specific situations (e.g., "Ordering Coffee") with AI grading your grammar and naturalness.',
    borderHover: 'hover:border-tealAccent',
    iconBg: 'bg-tealAccent/20 text-tealAccent',
    iconHover: 'group-hover:bg-tealAccent',
    ctaColor: 'text-tealAccent',
  },
  {
    mode: 'story',
    icon: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/National%20Park.png',
    title: 'Story Mode',
    description:
      'Choose a scenario or describe your own to practice conversational skills. The AI adapts to your replies dynamically.',
    borderHover: 'hover:border-purpleAccent',
    iconBg: 'bg-purpleAccent/20 text-purpleAccent',
    iconHover: 'group-hover:bg-purpleAccent',
    ctaColor: 'text-purpleAccent',
  },
  {
    mode: 'translator',
    icon: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Sparkles.png',
    title: 'Tone Translator',
    description:
      'Input any sentence and see it transformed into Formal, Friendly, Informal, and Native tones.',
    borderHover: 'hover:border-goldAura',
    iconBg: 'bg-goldAura/20 text-goldAura',
    iconHover: 'group-hover:bg-goldAura',
    ctaColor: 'text-goldAura',
  },
  {
    mode: 'quiz',
    icon: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/High%20Voltage.png',
    title: 'Vocab Quiz',
    description: "Test your memory on the vocabulary and grammar items you've saved.",
    borderHover: 'hover:border-tealAccent',
    iconBg: 'bg-tealAccent/20 text-tealAccent',
    iconHover: 'group-hover:bg-tealAccent',
    ctaColor: 'text-tealAccent',
  },
  {
    mode: 'vocab_hub',
    icon: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Ringed%20Planet.png',
    title: 'Vocab Hub',
    description:
      'Master vocabulary through morphological breakdown, contextual embedding, and interactive mind maps.',
    borderHover: 'hover:border-purpleAccent',
    iconBg: 'bg-purpleAccent/20 text-purpleAccent',
    iconHover: 'group-hover:bg-purpleAccent',
    ctaColor: 'text-purpleAccent',
  },
  {
    mode: 'live',
    icon: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Studio%20Microphone.png',
    title: 'Live Conversation',
    description: 'Practice natural, real-time voice conversations with an AI English coach.',
    borderHover: 'hover:border-goldAura',
    iconBg: 'bg-goldAura/20 text-goldAura',
    iconHover: 'group-hover:bg-goldAura',
    ctaColor: 'text-goldAura',
  },
];
