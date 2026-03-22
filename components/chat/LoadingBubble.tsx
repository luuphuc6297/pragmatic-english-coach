import React from 'react';
import {Bot} from 'lucide-react';
import {ChatMode} from '../../types';
import { Avatar3D } from '../ui/Avatar3D';
import { BOT_AVATAR } from '../../configs/constants';

interface LoadingBubbleProps {
  chatMode: ChatMode;
}

const LoadingBubble: React.FC<LoadingBubbleProps> = ({chatMode}) => {
  const avatarColorClass =
    chatMode === 'translator'
      ? 'bg-indigo-500 text-white'
      : chatMode === 'story'
        ? 'bg-purple-500 text-white'
        : chatMode === 'quiz'
          ? 'bg-amber-500 text-white'
          : 'bg-emerald-500 text-white';

  const dotColorClass =
    chatMode === 'translator'
      ? 'bg-indigo-400'
      : chatMode === 'story'
        ? 'bg-purple-400'
        : chatMode === 'quiz'
          ? 'bg-amber-400'
          : 'bg-brand-400';

  return (
    <div className="flex w-full justify-start animate-in fade-in zoom-in-95 duration-300">
      <div className="flex max-w-[85%] flex-row gap-3 opacity-90">
        <div
          className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mt-1 animate-pulse overflow-hidden border border-white/10 ${avatarColorClass}`}
        >
          <Avatar3D 
            src={BOT_AVATAR} 
            className="w-full h-full object-cover scale-110"
            fallback={<Bot size={20} />}
          />
        </div>
        <div className="bg-navy-muted text-slate-200 border border-white/10 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm flex items-center gap-1.5">
          <span className="text-xs text-slate-400 font-bold mr-2 uppercase tracking-wider">
            Analysis in progress
          </span>
          <div className="flex gap-1">
            <div
              className={`w-1.5 h-1.5 rounded-full animate-bounce ${dotColorClass}`}
              style={{animationDelay: '0ms'}}
            ></div>
            <div
              className={`w-1.5 h-1.5 rounded-full animate-bounce ${dotColorClass}`}
              style={{animationDelay: '150ms'}}
            ></div>
            <div
              className={`w-1.5 h-1.5 rounded-full animate-bounce ${dotColorClass}`}
              style={{animationDelay: '300ms'}}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingBubble;
