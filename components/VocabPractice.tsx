import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, ArrowRight, RefreshCw, Lightbulb, BookOpen } from 'lucide-react';
import { SavedItem, Exercise } from '../types';
import { generateExercises } from '../services/geminiService';

interface VocabPracticeProps {
  savedItems: SavedItem[];
  onUpdateItem: (item: SavedItem) => void;
}

const VocabPractice: React.FC<VocabPracticeProps> = ({ savedItems, onUpdateItem }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const loadExercises = async () => {
    if (savedItems.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const generated = await generateExercises(savedItems, 5);
      setExercises(generated);
      setCurrentIndex(0);
      setScore(0);
      setIsFinished(false);
      resetTurn();
    } catch (err) {
      setError("Failed to generate exercises. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (exercises.length === 0 && savedItems.length > 0) {
      loadExercises();
    }
  }, [savedItems]);

  const resetTurn = () => {
    setUserAnswer('');
    setIsSubmitted(false);
    setIsCorrect(false);
    setShowHint(false);
  };

  const handleSubmit = () => {
    if (!userAnswer.trim()) return;
    
    const currentExercise = exercises[currentIndex];
    let correct = false;
    
    if (currentExercise.type === 'fill-in-the-blank') {
      correct = userAnswer === currentExercise.answer;
    } else {
      // For sentence construction, we do a simple check if the target word is included
      // A more robust check would use AI to evaluate the sentence
      correct = userAnswer.toLowerCase().includes(currentExercise.targetWord.toLowerCase());
    }
    
    setIsCorrect(correct);
    setIsSubmitted(true);
    if (correct) {
      setScore(s => s + 1);
    }

    // Update mastery score
    const targetItem = savedItems.find(item => item.correction.toLowerCase() === currentExercise.targetWord.toLowerCase());
    if (targetItem) {
      const currentScore = targetItem.masteryScore || 0;
      const newScore = correct 
        ? Math.min(100, currentScore + 10) 
        : Math.max(0, currentScore - 5);
      
      onUpdateItem({
        ...targetItem,
        masteryScore: newScore
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(i => i + 1);
      resetTurn();
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={32} />
        <p className="text-slate-600 font-medium">Generating your personalized exercises...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="text-rose-500 mb-4">
          <XCircle size={48} />
        </div>
        <p className="text-slate-800 font-medium mb-4">{error}</p>
        <button
          onClick={loadExercises}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
        >
          <RefreshCw size={18} />
          Try Again
        </button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Practice Complete!</h2>
        <p className="text-slate-600 mb-8">
          You scored {score} out of {exercises.length}.
        </p>
        <button
          onClick={loadExercises}
          className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-medium flex items-center gap-2 shadow-sm"
        >
          <RefreshCw size={20} />
          Practice Again
        </button>
      </div>
    );
  }

  if (exercises.length === 0) return null;

  const currentExercise = exercises[currentIndex];

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">Practice Session</h3>
        <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          {currentIndex + 1} / {exercises.length}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="mb-2 text-sm font-semibold text-emerald-600 uppercase tracking-wider">
            {currentExercise.type === 'fill-in-the-blank' ? 'Fill in the blank' : 'Sentence Construction'}
          </div>
          
          <h4 className="text-xl font-medium text-slate-800 mb-6 leading-relaxed">
            {currentExercise.question}
          </h4>

          {!isSubmitted ? (
            <div className="space-y-4">
              {currentExercise.type === 'fill-in-the-blank' && currentExercise.options ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentExercise.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => setUserAnswer(option)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        userAnswer === option
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-medium'
                          : 'border-slate-200 hover:border-emerald-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder={`Write a sentence using "${currentExercise.targetWord}"...`}
                  className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-0 resize-none h-32 text-slate-700"
                />
              )}

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => setShowHint(true)}
                  disabled={showHint}
                  className={`flex items-center gap-2 text-sm font-medium ${
                    showHint ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'
                  } transition-colors`}
                >
                  <Lightbulb size={16} />
                  {showHint ? currentExercise.hint : 'Need a hint?'}
                </button>
                
                <button
                  onClick={handleSubmit}
                  disabled={!userAnswer.trim()}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Check Answer
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className={`p-4 rounded-xl flex items-start gap-3 ${
                isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
              }`}>
                {isCorrect ? (
                  <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                ) : (
                  <XCircle className="text-rose-500 shrink-0 mt-0.5" size={20} />
                )}
                <div>
                  <p className="font-bold mb-1">
                    {isCorrect ? 'Correct!' : 'Not quite right.'}
                  </p>
                  <p className="opacity-90">
                    {currentExercise.explanation}
                  </p>
                  {!isCorrect && currentExercise.type === 'sentence-construction' && (
                    <div className="mt-3 p-3 bg-white/50 rounded-lg text-sm">
                      <span className="font-semibold block mb-1">Example answer:</span>
                      {currentExercise.answer}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-medium flex items-center gap-2"
                >
                  {currentIndex < exercises.length - 1 ? 'Next Question' : 'See Results'}
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VocabPractice;
