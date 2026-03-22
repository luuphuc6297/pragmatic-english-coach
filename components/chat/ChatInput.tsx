import React from 'react';
import { Send, Mic, Loader, Plus, Sparkles } from 'lucide-react';
import { ChatMode } from '../../types';
import {styles} from '../../configs/themeConfig';

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onMicClick: () => void;
  isLoading: boolean;
  isListening: boolean;
  isStoryWaiting: boolean;
  chatMode: ChatMode;
  onStartNew?: () => void;
  onNextLesson?: (direction: 'same' | 'harder' | 'easier') => void;
}

const RING_CLASSES: Record<ChatMode, string> = {
  translator: 'focus-within:ring-indigo-500/30 focus-within:border-indigo-500',
  story: 'focus-within:ring-purple-500/30 focus-within:border-purple-500',
  quiz: 'focus-within:ring-amber-500/30 focus-within:border-amber-500',
  roleplay: 'focus-within:ring-primary/30 focus-within:border-primary',
  dialogues: 'focus-within:ring-blue-500/30 focus-within:border-blue-500',
  vocab_hub: 'focus-within:ring-emerald-500/30 focus-within:border-emerald-500',
  live: 'focus-within:ring-rose-500/30 focus-within:border-rose-500',
};

const SEND_BUTTON_CLASSES: Record<ChatMode, string> = {
  translator: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20',
  story: 'bg-accent-purple hover:bg-accent-purple/90 text-white shadow-accent-purple/20',
  quiz: 'bg-highlight-gold hover:bg-highlight-gold/90 text-background-dark shadow-highlight-gold/20',
  roleplay: 'bg-primary hover:bg-primary/90 text-background-dark shadow-primary/20',
  dialogues: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20',
  vocab_hub: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',
  live: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20',
};

const PLACEHOLDER: Record<ChatMode, string> = {
  translator: 'Enter text to translate...',
  story: 'Type your reply...',
  quiz: 'Type your answer...',
  roleplay: 'Type your answer...',
  dialogues: 'Type your reply...',
  vocab_hub: 'Search vocabulary...',
  live: 'Speak or type...',
};

const ChatInput: React.FC<ChatInputProps> = ({
  inputText,
  setInputText,
  onSend,
  onKeyDown,
  onMicClick,
  isLoading,
  isListening,
  isStoryWaiting,
  chatMode,
  onStartNew,
  onNextLesson,
}) => {
  return (
    <div className="absolute bottom-0 left-0 w-full bg-navy-muted/20 backdrop-blur-xl border-t border-white/5 px-3 py-4 md:px-6 md:py-6 z-20 transition-all">
      <div className="max-w-4xl mx-auto">
        <div className={`flex items-center gap-4 bg-navy-muted rounded-2xl p-2 border border-white/10 shadow-2xl ${RING_CLASSES[chatMode]} ${isLoading ? 'opacity-80' : ''}`}>
          <input
            type="text"
            autoFocus={false}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              isStoryWaiting ? "Review the AI's feedback above to continue..." : PLACEHOLDER[chatMode]
            }
            className="flex-1 bg-transparent border-none outline-none focus:ring-0 px-4 py-3 text-base text-white placeholder:text-slate-500 min-w-0"
            disabled={isLoading || isStoryWaiting}
          />

          <div className="flex items-center gap-2 pr-2">
            <button
              onClick={onMicClick}
              disabled={isStoryWaiting}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors flex-shrink-0 ${isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-md'
                  : isStoryWaiting ? 'bg-white/5 text-slate-600' : 'bg-white/5 text-slate-400 hover:text-primary'
                }`}
              title="Voice Input"
            >
              <Mic size={20} />
            </button>

            <button
              onClick={onSend}
              disabled={!inputText.trim() || isLoading || isStoryWaiting}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:active:scale-100 disabled:hover:scale-100 flex-shrink-0 shadow-lg ${SEND_BUTTON_CLASSES[chatMode]}`}
            >
              {isLoading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
        <div className="flex justify-center items-center gap-4 mt-4">
          {onStartNew && (
            <button
              onClick={onStartNew}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-full font-bold transition-colors shadow-sm text-xs disabled:opacity-50 border border-white/10"
              title="New Conversation"
            >
              <Plus size={14} />
              <span>New Conversation</span>
            </button>
          )}
          {chatMode !== 'translator' && onNextLesson && (
            <button
              onClick={() => onNextLesson('same')}
              disabled={isLoading}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-slate-300 hover:text-white rounded-full text-xs font-bold transition-all border border-white/10 flex items-center gap-1.5"
              title="Next Scenario"
            >
              <Sparkles size={14} />
              <span>Next Scenario</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
