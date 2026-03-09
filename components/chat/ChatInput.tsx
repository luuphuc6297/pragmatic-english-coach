import React from 'react';
import { Send, Mic, Loader2 } from 'lucide-react';
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
}

const RING_CLASSES: Record<ChatMode, string> = {
  translator: 'focus-within:ring-indigo-500/30 focus-within:border-indigo-500',
  story: 'focus-within:ring-purple-500/30 focus-within:border-purple-500',
  quiz: 'focus-within:ring-amber-500/30 focus-within:border-amber-500',
  roleplay: 'focus-within:ring-brand-500/30 focus-within:border-brand-500',
  dialogues: 'focus-within:ring-blue-500/30 focus-within:border-blue-500',
  vocab_hub: 'focus-within:ring-emerald-500/30 focus-within:border-emerald-500',
  live: 'focus-within:ring-rose-500/30 focus-within:border-rose-500',
};

const SEND_BUTTON_CLASSES: Record<ChatMode, string> = {
  translator: 'bg-indigo-600 hover:bg-indigo-700',
  story: 'bg-purple-600 hover:bg-purple-700',
  quiz: 'bg-amber-600 hover:bg-amber-700',
  roleplay: 'bg-brand-600 hover:bg-brand-700',
  dialogues: 'bg-blue-600 hover:bg-blue-700',
  vocab_hub: 'bg-emerald-600 hover:bg-emerald-700',
  live: 'bg-rose-600 hover:bg-rose-700',
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
}) => {
  return (
    <div className="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-200 px-3 py-3 md:px-4 md:py-4 z-20 transition-all">
      <div className="max-w-4xl mx-auto">
        <div className={`${styles.input.chatContainer} ${RING_CLASSES[chatMode]} ${isLoading ? 'opacity-80' : ''}`}>
          <button
            onClick={onMicClick}
            disabled={isStoryWaiting}
            className={`p-3 rounded-full transition-colors flex-shrink-0 ${isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-md'
                : isStoryWaiting ? 'text-slate-300' : 'text-slate-400 hover:text-brand-600 hover:bg-white'
              }`}
            title="Voice Input"
          >
            <Mic size={22} />
          </button>

          <input
            type="text"
            autoFocus={false}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              isStoryWaiting ? "Review the AI's feedback above to continue..." : PLACEHOLDER[chatMode]
            }
            className="flex-1 bg-transparent border-none outline-none focus:ring-0 px-2 py-3 text-base text-slate-800 placeholder-slate-400 min-w-0"
            disabled={isLoading || isStoryWaiting}
          />

          <button
            onClick={onSend}
            disabled={!inputText.trim() || isLoading || isStoryWaiting}
            className={`p-3 text-white rounded-full shadow-md transition-all transform active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:active:scale-100 flex-shrink-0 ${SEND_BUTTON_CLASSES[chatMode]}`}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
