import React from 'react';
import {Lightbulb, Type, AlignLeft, EyeOff} from 'lucide-react';
import {LessonContext} from '../../types';
import {styles} from '../../configs/themeConfig';

interface ProgressiveHintProps {
  hints: LessonContext['hints'];
  currentLevel: number;
  onRequestHint: () => void;
  onResetHint: () => void;
  translationDirection?: 'VN_to_EN' | 'EN_to_VN';
}

const HINT_ICONS = [Lightbulb, AlignLeft, Type] as const;

const ProgressiveHint: React.FC<ProgressiveHintProps> = ({
  hints,
  currentLevel,
  onRequestHint,
  onResetHint,
  translationDirection = 'VN_to_EN',
}) => {
  const Icon = HINT_ICONS[currentLevel] ?? Lightbulb;
  const isMaxed = currentLevel >= 3;
  const isEnToVn = translationDirection === 'EN_to_VN';

  return (
    <div className={styles.hint.container}>
      <div className="flex items-center justify-between">
        <span className={styles.hint.label}>
          {isEnToVn ? 'Gia sư thông minh' : 'Smart Tutor'}
          {currentLevel > 0 && (
            <span className="bg-highlight-gold/20 text-highlight-gold text-[10px] px-1.5 py-0.5 rounded-full ml-2">
              {currentLevel}/3
            </span>
          )}
        </span>

        <div className="flex items-center gap-2">
          {currentLevel > 0 && (
            <button
              onClick={onResetHint}
              className={`${styles.hint.pillButton} text-highlight-gold bg-highlight-gold/10 hover:bg-highlight-gold/20`}
              title={isEnToVn ? 'Ẩn gợi ý' : 'Hide Hints'}
            >
              <EyeOff className="w-3.5 h-3.5 mr-1.5" />
              {isEnToVn ? 'Ẩn' : 'Hide'}
            </button>
          )}

          {!isMaxed && (
            <button
              onClick={onRequestHint}
              className={`${styles.hint.pillButton} text-navy bg-highlight-gold hover:bg-highlight-gold/90 shadow-sm`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {currentLevel === 0 ? (isEnToVn ? 'Nhận gợi ý' : 'Get Hint') : (isEnToVn ? 'Gợi ý tiếp theo' : 'Next Hint')}
            </button>
          )}
        </div>
      </div>

      {currentLevel > 0 && (
        <div className="space-y-2 mt-1">
          {currentLevel >= 1 && (
            <div className={styles.hint.item}>
              <span className="font-bold text-highlight-gold mr-2 text-xs uppercase tracking-wide">
                {isEnToVn ? 'Ý nghĩa:' : 'Meaning:'}
              </span>
              {hints.level1}
            </div>
          )}
          {currentLevel >= 2 && (
            <div className={styles.hint.item}>
              <span className="font-bold text-highlight-gold mr-2 text-xs uppercase tracking-wide">
                {isEnToVn ? 'Cấu trúc:' : 'Structure:'}
              </span>
              {hints.level2}
            </div>
          )}
          {currentLevel >= 3 && (
            <div className={styles.hint.item}>
              <span className="font-bold text-highlight-gold mr-2 text-xs uppercase tracking-wide">
                {isEnToVn ? 'Từ vựng:' : 'Word:'}
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
