import React from 'react';
import {
  Languages,
  Briefcase,
  Smile,
  Coffee,
  MessageCircle,
  BookmarkPlus,
  Volume2,
  Loader,
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
  {icon: typeof MessageCircle; colorClass: string; bgClass: string; label: string; quote: string}
> = {
  formal: {
    icon: Briefcase,
    colorClass: 'text-indigo-400',
    bgClass: 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/20',
    label: 'Formal',
    quote: '"Kính gửi anh/chị..." (Trang trọng, lịch sự)',
  },
  friendly: {
    icon: Smile,
    colorClass: 'text-amber-400',
    bgClass: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20',
    label: 'Friendly',
    quote: '"Chào bạn, dạo này sao rồi?" (Thân thiện, cởi mở)',
  },
  informal: {
    icon: Coffee,
    colorClass: 'text-pink-400',
    bgClass: 'bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/20',
    label: 'Casual',
    quote: '"Ê, dạo này sao rồi?" (Thoải mái, suồng sã)',
  },
  conversational: {
    icon: MessageCircle,
    colorClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20',
    label: 'Neutral',
    quote: '"Chào bạn." (Giao tiếp tự nhiên hàng ngày)',
  },
};

const DEFAULT_TONE = {
  icon: MessageCircle,
  colorClass: 'text-slate-400',
  bgClass: 'bg-white/5 hover:bg-white/10 border-white/10',
  label: '',
  quote: '',
};

const TranslatorResult: React.FC<TranslatorResultProps> = ({
  msg,
  onSaveItem,
  onPlayAudio,
  audioLoadingId,
}) => {
  if (!msg.translation) return null;

  return (
    <div className="bg-navy-muted/50 rounded-2xl p-4 md:p-6 shadow-sm border border-white/10 w-full animate-in slide-in-from-left-2 fade-in">
      <div className="flex items-center gap-2 mb-4 text-indigo-400 pb-2 border-b border-white/10">
        <Languages size={18} />
        <span className="font-bold text-sm uppercase tracking-wide">Variations</span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {Object.entries(msg.translation.tones).map(([key, toneData]) => {
          const config = TONE_CONFIG[key] ?? DEFAULT_TONE;
          const Icon = config.icon;
          const label = config.label || key;
          
          // Handle both old format (string) and new format (object)
          const text = typeof toneData === 'string' ? toneData : toneData.text;
          const quote = typeof toneData === 'string' ? config.quote : toneData.quote;

          return (
            <div
              key={key}
              className={`p-4 rounded-xl border transition-all ${config.bgClass}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div
                  className={`flex items-center gap-2 text-xs font-bold ${config.colorClass} uppercase tracking-wider`}
                >
                  <Icon size={14} /> {label}
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={() =>
                      onSaveItem({
                        id: Date.now().toString(),
                        original: text,
                        correction: text,
                        type: 'vocabulary',
                        context: text,
                        timestamp: Date.now(),
                        masteryScore: 0,
                      })
                    }
                    className="p-1.5 rounded-full bg-white/5 text-slate-400 hover:text-primary hover:bg-white/10 transition-all"
                    title="Save to Dictionary"
                  >
                    <BookmarkPlus size={14} />
                  </button>
                  <button
                    onClick={() => onPlayAudio(msg.id, text, key)}
                    disabled={audioLoadingId === `${msg.id}-${key}`}
                    className="p-1.5 rounded-full bg-white/5 text-slate-400 hover:text-primary hover:bg-white/10 transition-all disabled:opacity-50"
                    title="Play Audio"
                  >
                    {audioLoadingId === `${msg.id}-${key}` ? (
                      <Loader size={14} className="animate-spin" />
                    ) : (
                      <Volume2 size={16} />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-slate-200 font-medium text-base leading-relaxed">
                  {text}
                </p>
                {quote && (
                  <p className="text-sm text-slate-400 italic">
                    {quote}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TranslatorResult;
