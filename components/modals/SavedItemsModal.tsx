import React, { useState, useMemo } from 'react';
import { SavedItem } from '../../types';
import { BookOpen, Trash2, Play, CheckCircle, Info, Loader, Clock, Tag, RefreshCw, Check, Search, X, Volume2, Bookmark, Image as ImageIcon } from 'lucide-react';
import { styles } from '../../configs/themeConfig';

interface SavedItemsModalProps {
  items: SavedItem[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onPractice: (item: SavedItem) => void;
  onSync?: () => Promise<void>;
  onPlayAudio?: (text: string) => Promise<void>;
  onGenerateImage?: (id: string, text: string, context?: string) => Promise<void>;
}

const SavedItemsModal: React.FC<SavedItemsModalProps> = ({ items, onClose, onDelete, onPractice, onSync, onPlayAudio, onGenerateImage }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPOS, setSelectedPOS] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [audioLoadingId, setAudioLoadingId] = useState<string | null>(null);
  const [imageLoadingId, setImageLoadingId] = useState<string | null>(null);

  const handleSync = async () => {
    if (!onSync) return;
    setIsSyncing(true);
    setSyncSuccess(false);
    await onSync();
    setIsSyncing(false);
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 2000);
  };

  const handlePlayAudio = async (id: string, text: string) => {
    if (!onPlayAudio) return;
    setAudioLoadingId(id);
    try {
      await onPlayAudio(text);
    } finally {
      setAudioLoadingId(null);
    }
  };

  const handleGenerateImage = async (id: string, text: string, context?: string) => {
    if (!onGenerateImage) return;
    setImageLoadingId(id);
    try {
      await onGenerateImage(id, text, context);
    } finally {
      setImageLoadingId(null);
    }
  };

  const POS_OPTIONS = [
    'Noun',
    'Verb',
    'Adjective',
    'Adverb',
    'Phrasal Verb',
    'Idiom',
    'Expression',
    'Other'
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
      result = result.filter(item => {
        const itemPOS = item.partOfSpeech?.toLowerCase().trim() || '';
        const targetPOS = selectedPOS.toLowerCase().trim();
        
        if (itemPOS === targetPOS) return true;
        
        // Handle cases where AI adds Vietnamese translation like "Phrasal Verb (Cụm động từ)"
        if (itemPOS.includes(targetPOS)) {
          // Prevent "Adverb" from matching "Verb"
          if (targetPOS === 'verb' && itemPOS.includes('adverb')) return false;
          // Prevent "Phrasal Verb" from matching "Verb"
          if (targetPOS === 'verb' && itemPOS.includes('phrasal verb')) return false;
          return true;
        }
        
        return false;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.original.toLowerCase().includes(q) || 
        item.correction.toLowerCase().includes(q)
      );
    }

    return result;
  }, [items, selectedCategory, selectedPOS, searchQuery]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-navy/80 backdrop-blur-sm">
      <div className="bg-navy/90 backdrop-blur-xl border border-glassBorder w-full max-w-[1000px] rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 px-6 py-5 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/20 text-primary shrink-0">
              <BookOpen size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight tracking-tight text-white">My Learning Library</h2>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Aura Coach v2.0</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="hidden md:flex flex-col min-w-64 h-10">
              <div className="flex w-full flex-1 items-stretch rounded-xl h-full bg-white/5 border border-white/10 focus-within:border-primary transition-colors">
                <div className="text-slate-400 flex items-center justify-center pl-4">
                  <Search size={16} />
                </div>
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-sm placeholder:text-slate-500 px-3 text-white outline-none" 
                  placeholder="Search vocabulary..."
                />
              </div>
            </label>
            {onSync && (
              <button
                onClick={handleSync}
                disabled={isSyncing}
                title="Sync Library to Cloud"
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-colors disabled:opacity-50 shrink-0"
              >
                {syncSuccess ? (
                  <Check size={20} className="text-emerald-500" />
                ) : (
                  <RefreshCw size={20} className={isSyncing ? 'animate-spin text-primary' : ''} />
                )}
              </button>
            )}
            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 text-slate-300 transition-colors shrink-0"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Category Pills */}
        <div className="flex gap-3 px-6 py-4 overflow-x-auto custom-scrollbar border-b border-white/10 shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex h-10 shrink-0 items-center justify-center gap-2 rounded-full px-5 transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-navy shadow-lg shadow-primary/20 font-bold'
                  : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 font-medium'
              }`}
            >
              <Tag size={16} />
              <span className="text-sm">{cat}</span>
            </button>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="px-6 border-b border-white/10 bg-white/5 shrink-0">
          <div className="flex gap-6 overflow-x-auto custom-scrollbar">
            {['All', ...POS_OPTIONS].map((pos) => (
              <button
                key={pos}
                onClick={() => setSelectedPOS(pos)}
                className={`flex flex-col items-center justify-center pb-3 pt-4 px-1 min-w-max transition-colors border-b-2 ${
                  selectedPOS === pos
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200 font-medium'
                }`}
              >
                <span className="text-sm">{pos}</span>
              </button>
            ))}
          </div>
        </div>

        {/* List Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[60vh] custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <BookOpen size={48} className="mb-4 opacity-20" />
              <p>No saved items found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map(item => (
                <SavedItemCard
                  key={item.id}
                  item={item}
                  onDelete={onDelete}
                  onPractice={onPractice}
                  onPlayAudio={handlePlayAudio}
                  audioLoadingId={audioLoadingId}
                  onGenerateImage={handleGenerateImage}
                  imageLoadingId={imageLoadingId}
                />
              ))}
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
  onPlayAudio: (id: string, text: string) => void;
  audioLoadingId: string | null;
  onGenerateImage?: (id: string, text: string, context?: string) => Promise<void>;
  imageLoadingId: string | null;
}> = ({ item, onDelete, onPractice, onPlayAudio, audioLoadingId, onGenerateImage, imageLoadingId }) => {
  const [now] = React.useState(() => Date.now());
  const isDue = (item.nextReviewDate || 0) <= now;
  const nextReviewText = isDue 
    ? "Due for review" 
    : `Review in ${Math.ceil(((item.nextReviewDate || 0) - now) / (1000 * 60 * 60 * 24))} days`;

  // Determine colors based on type or status
  const gradientClass = item.type === 'grammar' 
    ? 'from-blue-500/20 to-indigo-500/20' 
    : 'from-primary/20 to-indigo-500/20';
  
  const hoverTextClass = item.type === 'grammar' ? 'group-hover:text-blue-400' : 'group-hover:text-primary';
  const accentTextClass = item.type === 'grammar' ? 'text-blue-400' : 'text-primary';
  const badgeClass = isDue 
    ? 'bg-highlight-gold/90 text-navy' 
    : 'bg-primary/90 text-navy';
  const badgeIcon = isDue ? <Clock size={12} /> : <CheckCircle size={12} />;

  // Generate a placeholder image based on the word
  const seed = encodeURIComponent(item.correction || item.original);
  const imageUrl = item.imageUrl || `https://api.dicebear.com/9.x/shapes/svg?seed=${seed}&backgroundColor=0a0b1e`;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row group hover:border-primary/50 transition-all duration-300">
      <div className="w-full md:w-48 h-32 md:h-auto bg-navy-muted relative overflow-hidden shrink-0 group/image">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} z-10`}></div>
        <div 
          className="w-full h-full bg-center bg-cover opacity-50 transition-transform duration-500 group-hover/image:scale-110" 
          style={{ backgroundImage: `url('${imageUrl}')` }}
        ></div>
        <div className={`absolute top-3 left-3 px-2.5 py-1 ${badgeClass} rounded-md text-[10px] font-bold uppercase flex items-center gap-1.5 z-20 shadow-lg`}>
          {badgeIcon}
          {nextReviewText}
        </div>
        {onGenerateImage && !item.imageUrl && (
          <button
            onClick={() => onGenerateImage(item.id, item.correction || item.original, item.context)}
            disabled={imageLoadingId === item.id}
            className="absolute bottom-3 right-3 z-30 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover/image:opacity-100 disabled:opacity-50"
            title="Generate Illustration"
          >
            {imageLoadingId === item.id ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <ImageIcon size={16} />
            )}
          </button>
        )}
      </div>
      
      <div className="flex-1 p-5 flex flex-col justify-between gap-4">
        <div>
          <div className="flex items-start justify-between">
            <div>
              <h3 className={`text-2xl font-bold text-white ${hoverTextClass} transition-colors flex items-center gap-2`}>
                {item.correction}
                {item.original !== item.correction && (
                  <span className="text-sm font-normal text-slate-500 line-through decoration-rose-500/50">
                    {item.original}
                  </span>
                )}
              </h3>
              <p className={`text-sm ${accentTextClass} font-medium mt-1`}>
                {item.partOfSpeech ? `${item.partOfSpeech}` : (item.type === 'grammar' ? 'Grammar' : 'Vocabulary')}
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => onPlayAudio(item.id, item.correction || item.original)}
                disabled={audioLoadingId === item.id}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-slate-300 hover:text-primary transition-colors disabled:opacity-50"
              >
                {audioLoadingId === item.id ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <Volume2 size={16} />
                )}
              </button>
              <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-highlight-gold transition-colors">
                <Bookmark size={16} fill="currentColor" />
              </button>
            </div>
          </div>
          
          <div className="mt-4 space-y-3">
            <div className="text-slate-300 text-sm leading-relaxed">
              <span className={`${accentTextClass} font-semibold block mb-2`}>Explanation:</span>
              {item.explanation ? (
                <div className="space-y-2">
                  {item.explanation.replace(/(?:\s+)(\d+[).])/g, '\n$1').split('\n').filter(line => line.trim() !== '').map((line, idx) => (
                    <p key={idx} className="pl-3 border-l-2 border-white/10 text-slate-300">{line.trim()}</p>
                  ))}
                </div>
              ) : (
                <span className="text-slate-500 italic">Loading explanation...</span>
              )}
            </div>
            
            {item.examples && item.examples.length > 0 ? (
              <div className="space-y-2">
                {item.examples.map((ex, idx) => (
                  <div key={idx} className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <p className="text-sm text-slate-200 italic">"{ex.en}"</p>
                    <p className="text-xs text-slate-400 mt-1">"{ex.vn}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="text-sm text-slate-200 italic">"{item.context}"</p>
                <p className="text-xs text-slate-400 mt-1.5">Context from your conversation</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-2">
          <button 
            onClick={() => onDelete(item.id)} 
            className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1.5 text-sm font-medium px-2 py-1 rounded-lg hover:bg-rose-500/10"
          >
            <Trash2 size={16} /> Delete
          </button>
          <button 
            onClick={() => onPractice(item)}
            className="bg-primary hover:bg-primary/80 text-navy px-6 py-2 rounded-xl text-sm font-bold transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <Play size={16} fill="currentColor" /> Practice
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavedItemsModal;
