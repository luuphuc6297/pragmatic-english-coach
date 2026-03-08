import React, { useState, useEffect } from 'react';
import { SavedItem } from '../types';
import { RefreshCw, CheckCircle, XCircle, ArrowRight, BookOpen } from 'lucide-react';

interface FlashcardsProps {
  savedItems: SavedItem[];
  onUpdateItem: (item: SavedItem) => void;
}

const Flashcards: React.FC<FlashcardsProps> = ({ savedItems, onUpdateItem }) => {
  const [cards, setCards] = useState<SavedItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Select up to 10 cards that need review, or just random ones if none are due
    const now = Date.now();
    let dueCards = savedItems.filter(item => !item.nextReviewDate || item.nextReviewDate <= now);
    
    if (dueCards.length === 0) {
      // If no cards are due, just pick random ones
      dueCards = [...savedItems].sort(() => 0.5 - Math.random()).slice(0, 10);
    } else {
      // Sort by due date, oldest first
      dueCards = dueCards.sort((a, b) => (a.nextReviewDate || 0) - (b.nextReviewDate || 0)).slice(0, 10);
    }
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCards(dueCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
  }, [savedItems]);

  const handleAnswer = (quality: number) => {
    // SuperMemo-2 Algorithm (simplified)
    // quality: 0 (blackout) to 5 (perfect)
    const card = cards[currentIndex];
    
    let easeFactor = card.easeFactor || 2.5;
    let interval = card.interval || 0;
    let reviewCount = card.reviewCount || 0;
    let masteryScore = card.masteryScore || 0;

    if (quality < 3) {
      // Incorrect or hard
      reviewCount = 0;
      interval = 1;
      masteryScore = Math.max(0, masteryScore - 10);
    } else {
      // Correct
      if (reviewCount === 0) {
        interval = 1;
      } else if (reviewCount === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      reviewCount += 1;
      masteryScore = Math.min(100, masteryScore + (quality === 5 ? 15 : 10));
    }

    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    const nextReviewDate = Date.now() + interval * 24 * 60 * 60 * 1000;

    onUpdateItem({
      ...card,
      easeFactor,
      interval,
      reviewCount,
      masteryScore,
      nextReviewDate
    });

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(i => i + 1);
      setIsFlipped(false);
    } else {
      setIsFinished(true);
    }
  };

  if (savedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="text-slate-400" size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">No Vocabulary Saved</h3>
        <p className="text-slate-500 max-w-md">
          Save some words or phrases from your conversations to start practicing them here.
        </p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Review Complete!</h2>
        <p className="text-slate-600 mb-8">
          You've reviewed {cards.length} items. Keep up the good work!
        </p>
        <button
          onClick={() => {
            const now = Date.now();
            let dueCards = savedItems.filter(item => !item.nextReviewDate || item.nextReviewDate <= now);
            if (dueCards.length === 0) {
              dueCards = [...savedItems].sort(() => 0.5 - Math.random()).slice(0, 10);
            } else {
              dueCards = dueCards.sort((a, b) => (a.nextReviewDate || 0) - (b.nextReviewDate || 0)).slice(0, 10);
            }
            setCards(dueCards);
            setCurrentIndex(0);
            setIsFlipped(false);
            setIsFinished(false);
          }}
          className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-medium flex items-center gap-2 shadow-sm"
        >
          <RefreshCw size={20} />
          Review More
        </button>
      </div>
    );
  }

  if (cards.length === 0) return null;

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col items-center">
      <div className="flex justify-between items-center w-full mb-6">
        <h3 className="text-lg font-bold text-slate-800">Flashcards</h3>
        <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          {currentIndex + 1} / {cards.length}
        </div>
      </div>

      <div 
        className="w-full aspect-[4/3] perspective-1000 cursor-pointer"
        onClick={() => !isFlipped && setIsFlipped(true)}
      >
        <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center p-8 text-center">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
              {currentCard.type === 'vocabulary' ? 'Vocabulary' : 'Grammar'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              {currentCard.correction}
            </h2>
            {currentCard.partOfSpeech && (
              <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium mb-4">
                {currentCard.partOfSpeech}
              </span>
            )}
            <p className="text-slate-400 mt-8">Click to reveal</p>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full backface-hidden bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center p-8 text-center rotate-y-180 overflow-y-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              {currentCard.correction}
            </h2>
            
            {currentCard.original !== currentCard.correction && (
              <div className="mb-4">
                <span className="text-sm text-slate-500">You said: </span>
                <span className="text-sm text-rose-500 line-through">{currentCard.original}</span>
              </div>
            )}

            <div className="bg-slate-50 p-4 rounded-xl w-full mb-4">
              <p className="text-slate-700 italic">"{currentCard.context}"</p>
            </div>

            {currentCard.explanation && (
              <p className="text-slate-600 text-sm mb-4">{currentCard.explanation}</p>
            )}

            {currentCard.examples && currentCard.examples.length > 0 && (
              <div className="w-full text-left mt-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Examples</h4>
                <ul className="space-y-2">
                  {currentCard.examples.slice(0, 2).map((ex, idx) => (
                    <li key={idx} className="text-sm">
                      <p className="text-slate-800 font-medium">{ex.en}</p>
                      <p className="text-slate-500">{ex.vn}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={`w-full mt-8 transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <h4 className="text-center text-sm font-medium text-slate-500 mb-4">How well did you know this?</h4>
        <div className="grid grid-cols-4 gap-2 md:gap-4">
          <button
            onClick={(e) => { e.stopPropagation(); handleAnswer(1); }}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors border border-rose-100"
          >
            <span className="font-bold text-lg mb-1">Again</span>
            <span className="text-xs opacity-80">&lt; 1m</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleAnswer(3); }}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors border border-amber-100"
          >
            <span className="font-bold text-lg mb-1">Hard</span>
            <span className="text-xs opacity-80">1d</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleAnswer(4); }}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors border border-emerald-100"
          >
            <span className="font-bold text-lg mb-1">Good</span>
            <span className="text-xs opacity-80">3d</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleAnswer(5); }}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100"
          >
            <span className="font-bold text-lg mb-1">Easy</span>
            <span className="text-xs opacity-80">7d</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Flashcards;
