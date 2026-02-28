import React from 'react';
import {
  Languages,
  Briefcase,
  Smile,
  Coffee,
  MessageCircle,
  BookmarkPlus,
  Volume2,
  Loader2,
} from 'lucide-react';
import {ChatMessage, SavedItem} from '../../types';

interface TranslatorResultProps {
  msg: ChatMessage;
  onSaveItem: (item: SavedItem) => void;
  onPlayAudio: (msgId: string, text: string, toneKey: string) => void;
  audioLoadingId: string | null;
}

const TONE_CONFIG: Record<
  string,
  {icon: typeof MessageCircle; colorClass: string; bgClass: string; label: string}
> = {
  formal: {
    icon: Briefcase,
    colorClass: 'text-indigo-600',
    bgClass: 'bg-indigo-50/30 hover:bg-indigo-50',
    label: 'Formal',
  },
  friendly: {
    icon: Smile,
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50/30 hover:bg-amber-50',
    label: 'Friendly',
  },
  informal: {
    icon: Coffee,
    colorClass: 'text-pink-600',
    bgClass: 'bg-pink-50/30 hover:bg-pink-50',
    label: 'Casual',
  },
  conversational: {
    icon: MessageCircle,
    colorClass: 'text-emerald-600',
    bgClass: 'bg-emerald-50/30 hover:bg-emerald-50',
    label: 'Neutral',
  },
};

const DEFAULT_TONE = {
  icon: MessageCircle,
  colorClass: 'text-slate-600',
  bgClass: 'bg-slate-50/50',
  label: '',
};

const TranslatorResult: React.FC<TranslatorResultProps> = ({
  msg,
  onSaveItem,
  onPlayAudio,
  audioLoadingId,
}) => {
  if (!msg.translation) return null;

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-indigo-100 w-full animate-in slide-in-from-left-2 fade-in">
      <div className="flex items-center gap-2 mb-4 text-indigo-600 pb-2 border-b border-indigo-50">
        <Languages size={18} />
        <span className="font-bold text-sm uppercase tracking-wide">Variations</span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {Object.entries(msg.translation.tones).map(([key, text]) => {
          const config = TONE_CONFIG[key] ?? DEFAULT_TONE;
          const Icon = config.icon;
          const label = config.label || key;

          return (
            <div
              key={key}
              className={`p-4 rounded-xl border border-transparent hover:border-slate-200 transition-all ${config.bgClass}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`flex items-center gap-2 text-xs font-bold ${config.colorClass} uppercase tracking-wider`}
                >
                  <Icon size={14} /> {label}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      onSaveItem({
                        id: Date.now().toString(),
                        original: text as string,
                        correction: text as string,
                        type: 'vocabulary',
                        context: text as string,
                        timestamp: Date.now(),
                        masteryScore: 0,
                      })
                    }
                    className="p-1.5 rounded-full bg-white text-slate-400 hover:text-brand-600 hover:shadow-sm transition-all"
                    title="Save to Dictionary"
                  >
                    <BookmarkPlus size={14} />
                  </button>
                  <button
                    onClick={() => onPlayAudio(msg.id, text as string, key)}
                    disabled={audioLoadingId === `${msg.id}-${key}`}
                    className="p-1.5 rounded-full bg-white text-slate-400 hover:text-brand-600 hover:shadow-sm transition-all disabled:opacity-50"
                    title="Play Audio"
                  >
                    {audioLoadingId === `${msg.id}-${key}` ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Volume2 size={16} />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-slate-800 font-medium text-base leading-relaxed">
                {text as string}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TranslatorResult;
