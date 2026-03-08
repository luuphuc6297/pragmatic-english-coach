import React, { useState, useMemo } from 'react';
import { SavedItem } from '../types';
import { BookOpen, Trash2, Play, CheckCircle, Info, Loader2, Clock, Tag, RefreshCw, Check } from 'lucide-react';

interface SavedItemsModalProps {
  items: SavedItem[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onPractice: (item: SavedItem) => void;
  onSync?: () => Promise<void>;
}

const SavedItemsModal: React.FC<SavedItemsModalProps> = ({ items, onClose, onDelete, onPractice, onSync }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPOS, setSelectedPOS] = useState<string>('All');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const handleSync = async () => {
    if (!onSync) return;
    setIsSyncing(true);
    setSyncSuccess(false);
    await onSync();
    setIsSyncing(false);
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 2000);
  };

  const POS_OPTIONS = [
    'Noun (Danh từ)',
    'Verb (Động từ)',
    'Adjective (Tính từ)',
    'Adverb (Trạng từ)',
    'Phrasal Verb (Cụm động từ)',
    'Idiom (Thành ngữ)',
    'Expression (Cụm từ)',
    'Other (Khác)'
  ];

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(items.map(item => item.category).filter(Boolean) as string[]);
    return ['All', 'Uncategorized', ...Array.from(cats)];
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = items;
    
    if (selectedCategory !== 'All') {
      if (selectedCategory === 'Uncategorized') {
        result = result.filter(item => !item.category);
      } else {
        result = result.filter(item => item.category === selectedCategory);
      }
    }

    if (selectedPOS !== 'All') {
      result = result.filter(item => item.partOfSpeech === selectedPOS);
    }

    return result;
  }, [items, selectedCategory, selectedPOS]);

  // Group items by type
  const grammarItems = filteredItems.filter(i => i.type === 'grammar');
  const vocabItems = filteredItems.filter(i => i.type === 'vocabulary');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <BookOpen className="text-brand-500" /> My Learning Library
            </h2>
            <p className="text-sm text-slate-500 mt-1">Review and practice your saved corrections.</p>
          </div>
          <div className="flex items-center gap-2">
            {onSync && (
              <button
                onClick={handleSync}
                disabled={isSyncing}
                title="Sync Library to Cloud"
                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
              >
                {syncSuccess ? (
                  <Check size={20} className="text-emerald-500" />
                ) : (
                  <RefreshCw size={20} className={isSyncing ? 'animate-spin text-brand-500' : ''} />
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {/* Filters */}
          {items.length > 0 && (
            <div className="flex flex-col gap-4 mb-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                        selectedCategory === cat
                          ? 'bg-brand-500 text-white shadow-sm'
                          : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Part of Speech</h4>
                <div className="flex flex-wrap gap-2">
                  {['All', ...POS_OPTIONS].map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setSelectedPOS(pos)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                        selectedPOS === pos
                          ? 'bg-purple-500 text-white shadow-sm'
                          : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <BookOpen size={48} className="mb-4 opacity-20" />
              <p>No saved items yet.</p>
              <p className="text-sm">Click on underlined corrections in chat to save them.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Vocabulary Section */}
              {vocabItems.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span> Vocabulary ({vocabItems.length})
                  </h3>
                  <div className="grid gap-3">
                    {vocabItems.map(item => (
                      <SavedItemCard
                        key={item.id}
                        item={item}
                        onDelete={onDelete}
                        onPractice={onPractice}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Grammar Section */}
              {grammarItems.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> Grammar ({grammarItems.length})
                  </h3>
                  <div className="grid gap-3">
                    {grammarItems.map(item => (
                      <SavedItemCard
                        key={item.id}
                        item={item}
                        onDelete={onDelete}
                        onPractice={onPractice}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SavedItemCard: React.FC<{
  item: SavedItem;
  onDelete: (id: string) => void;
  onPractice: (item: SavedItem) => void;
}> = ({ item, onDelete, onPractice }) => {
  const [now] = React.useState(() => Date.now());
  const isDue = (item.nextReviewDate || 0) <= now;
  const nextReviewText = isDue 
    ? "Due for review" 
    : `Review in ${Math.ceil(((item.nextReviewDate || 0) - now) / (1000 * 60 * 60 * 24))} days`;

  return (
    <div className={`bg-white p-4 rounded-xl border ${isDue ? 'border-amber-200 shadow-amber-100/50' : 'border-slate-200'} shadow-sm hover:shadow-md transition-all group`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {item.original !== item.correction && (
            <>
              <span className="px-2 py-1 rounded-md bg-rose-50 text-rose-600 text-xs font-bold line-through decoration-rose-400/50">
                {item.original}
              </span>
              <span className="text-slate-300">→</span>
            </>
          )}
          <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 text-xs font-bold flex items-center gap-1">
            {item.correction} <CheckCircle size={10} />
          </span>
          {item.partOfSpeech && (
            <span className="px-2 py-1 rounded-md bg-purple-50 text-purple-600 text-[10px] font-bold uppercase tracking-wider">
              {item.partOfSpeech}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded-md ${isDue ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
            <Clock size={10} />
            {nextReviewText}
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onDelete(item.id)}
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-600 italic mb-4 border-l-2 border-slate-100 pl-3">
        "{item.context}"
      </p>

      {/* Dictionary Explanation */}
      {item.type === 'vocabulary' && (
        <div className="mb-4 bg-slate-50 rounded-lg p-3 border border-slate-100">
          {item.explanation ? (
            <>
              <div className="flex items-center gap-1.5 mb-2 text-brand-600">
                <Info size={14} />
                <span className="text-xs font-bold uppercase tracking-wider">Explanation</span>
              </div>
              <p className="text-sm text-slate-700 mb-3">{item.explanation}</p>

              {item.examples && item.examples.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Examples</span>
                  {item.examples.map((ex, idx) => (
                    <div key={idx} className="text-xs">
                      <p className="font-medium text-slate-800">"{ex.en}"</p>
                      <p className="text-slate-500">{ex.vn}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <Loader2 size={14} className="animate-spin" />
              Loading dictionary explanation...
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all"
                style={{ width: `${item.masteryScore}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Mastery</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-md">
            <Tag size={10} />
            {item.category || 'Uncategorized'}
          </div>
        </div>

        <button
          onClick={() => onPractice(item)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-600 hover:bg-brand-100 hover:text-brand-700 rounded-lg text-xs font-bold transition-colors"
        >
          <Play size={12} fill="currentColor" /> Practice
        </button>
      </div>
    </div>
  );
};

export default SavedItemsModal;
