import React from 'react';
import {Lightbulb, Type, AlignLeft, EyeOff} from 'lucide-react';
import {LessonContext} from '../../types';
import {styles} from '../../configs/themeConfig';

interface ProgressiveHintProps {
  hints: LessonContext['hints'];
  currentLevel: number;
  onRequestHint: () => void;
  onResetHint: () => void;
}

const HINT_ICONS = [Lightbulb, AlignLeft, Type] as const;
const HINT_BUTTON_TEXT = [
  'Get Hint (Semantic)',
  'Get Hint (Structure)',
  'Get Hint (Word)',
  'Hints Exhausted',
] as const;

const ProgressiveHint: React.FC<ProgressiveHintProps> = ({
  hints,
  currentLevel,
  onRequestHint,
  onResetHint,
}) => {
  const Icon = HINT_ICONS[currentLevel] ?? Lightbulb;
  const isMaxed = currentLevel >= 3;

  return (
    <div className={styles.hint.container}>
      <div className="flex items-center justify-between">
        <span className={styles.hint.label}>
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
              className={`${styles.hint.pillButton} text-yellow-700 bg-yellow-100 hover:bg-yellow-200`}
              title="Hide Hints"
            >
              <EyeOff className="w-3.5 h-3.5 mr-1.5" />
              Hide
            </button>
          )}

          {!isMaxed && (
            <button
              onClick={onRequestHint}
              className={`${styles.hint.pillButton} text-white bg-yellow-500 hover:bg-yellow-600 shadow-sm`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {currentLevel === 0 ? 'Get Hint' : 'Next Hint'}
            </button>
          )}
        </div>
      </div>

      {currentLevel > 0 && (
        <div className="space-y-2 mt-1">
          {currentLevel >= 1 && (
            <div className={styles.hint.item}>
              <span className="font-bold text-yellow-600 mr-2 text-xs uppercase tracking-wide">
                Meaning:
              </span>
              {hints.level1}
            </div>
          )}
          {currentLevel >= 2 && (
            <div className={styles.hint.item}>
              <span className="font-bold text-yellow-600 mr-2 text-xs uppercase tracking-wide">
                Structure:
              </span>
              {hints.level2}
            </div>
          )}
          {currentLevel >= 3 && (
            <div className={styles.hint.item}>
              <span className="font-bold text-yellow-600 mr-2 text-xs uppercase tracking-wide">
                Word:
              </span>
              {hints.level3}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressiveHint;
