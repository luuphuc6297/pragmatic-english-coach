import React from 'react';
import { Lightbulb, Type, AlignLeft, EyeOff } from 'lucide-react';
import { LessonContext } from '../types';

interface ProgressiveHintProps {
  hints: LessonContext['hints'];
  currentLevel: number;
  onRequestHint: () => void;
  onResetHint: () => void; // New prop to hide hints
}

const ProgressiveHint: React.FC<ProgressiveHintProps> = ({ hints, currentLevel, onRequestHint, onResetHint }) => {
  
  const getIcon = () => {
    switch (currentLevel) {
      case 0: return <Lightbulb className="w-4 h-4 mr-2" />;
      case 1: return <AlignLeft className="w-4 h-4 mr-2" />;
      case 2: return <Type className="w-4 h-4 mr-2" />;
      default: return <Lightbulb className="w-4 h-4 mr-2" />;
    }
  };

  const getButtonText = () => {
    switch (currentLevel) {
      case 0: return "Get Hint (Semantic)";
      case 1: return "Get Hint (Structure)";
      case 2: return "Get Hint (Word)";
      case 3: return "Hints Exhausted";
      default: return "Hint";
    }
  };

  const isMaxed = currentLevel >= 3;

  return (
    <div className="flex flex-col gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-100 transition-all duration-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-yellow-700 uppercase tracking-wider flex items-center gap-2">
          Smart Tutor
          {currentLevel > 0 && (
             <span className="bg-yellow-200 text-yellow-800 text-[10px] px-1.5 py-0.5 rounded-full">
               {currentLevel}/3
             </span>
          )}
        </span>
        
        <div className="flex items-center gap-2">
            {currentLevel > 0 && (
                <button
                    onClick={onResetHint}
                    className="flex items-center px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded-full transition-colors"
                    title="Hide Hints"
                >
                    <EyeOff className="w-3.5 h-3.5 mr-1.5" />
                    Hide
                </button>
            )}

            {!isMaxed && (
            <button
                onClick={onRequestHint}
                className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors shadow-sm"
            >
                {getIcon()}
                {currentLevel === 0 ? "Get Hint" : "Next Hint"}
            </button>
            )}
        </div>
      </div>

      {currentLevel > 0 && (
          <div className="space-y-2 mt-1">
            {currentLevel >= 1 && (
            <div className="text-sm text-slate-700 animate-in fade-in slide-in-from-top-2 p-2 bg-white/60 rounded-lg border border-yellow-100/50">
                <span className="font-bold text-yellow-600 mr-2 text-xs uppercase tracking-wide">Meaning:</span>
                {hints.level1}
            </div>
            )}
            {currentLevel >= 2 && (
            <div className="text-sm text-slate-700 animate-in fade-in slide-in-from-top-2 p-2 bg-white/60 rounded-lg border border-yellow-100/50">
                <span className="font-bold text-yellow-600 mr-2 text-xs uppercase tracking-wide">Structure:</span>
                {hints.level2}
            </div>
            )}
            {currentLevel >= 3 && (
            <div className="text-sm text-slate-700 animate-in fade-in slide-in-from-top-2 p-2 bg-white/60 rounded-lg border border-yellow-100/50">
                <span className="font-bold text-yellow-600 mr-2 text-xs uppercase tracking-wide">Word:</span>
                {hints.level3}
            </div>
            )}
        </div>
      )}
    </div>
  );
};

export default ProgressiveHint;