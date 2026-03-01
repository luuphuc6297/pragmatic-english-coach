import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Loader2, Network, BookOpen, Volume2, Plus, ArrowRight, X, Library, Tag, Trash2, Edit2, Check } from 'lucide-react';
import { CEFRLevel, SavedItem } from '../types';
import { generateWordAnalysis, WordAnalysis, generateTopicMindMap, MindMapNode } from '../services/geminiService';
import * as d3 from 'd3';
import VocabPractice from './VocabPractice';

interface VocabHubProps {
  userLevel: CEFRLevel;
  savedItems: SavedItem[];
  onUpdateItem: (item: SavedItem) => void;
  onDeleteItem: (id: string) => void;
}

const VocabHub: React.FC<VocabHubProps> = ({ userLevel, savedItems, onUpdateItem, onDeleteItem }) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'mindmap' | 'saved' | 'practice'>('analysis');
  
  // Analysis State
  const [searchWord, setSearchWord] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<WordAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mind Map State
  const [topic, setTopic] = useState('');
  const [isGeneratingMap, setIsGeneratingMap] = useState(false);
  const [mindMapData, setMindMapData] = useState<MindMapNode | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchWord.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await generateWordAnalysis(searchWord.trim());
      setAnalysisResult(result);
    } catch (err) {
      setError("Failed to analyze word. Please try again.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateMap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGeneratingMap(true);
    setError(null);
    try {
      const result = await generateTopicMindMap(topic.trim(), userLevel);
      setMindMapData(result);
    } catch (err) {
      setError("Failed to generate mind map. Please try again.");
      console.error(err);
    } finally {
      setIsGeneratingMap(false);
    }
  };

  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  // D3 Mind Map Rendering
  useEffect(() => {
    if (activeTab === 'mindmap' && mindMapData && svgRef.current) {
      const width = svgRef.current.clientWidth || 800;
      const height = svgRef.current.clientHeight || 600;
      
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove(); // Clear previous

      const g = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);

      const root = d3.hierarchy(mindMapData);
      
      // Create a radial tree layout
      const treeLayout = d3.tree<MindMapNode>()
        .size([2 * Math.PI, Math.min(width, height) / 2 - 100])
        .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

      treeLayout(root);

      // Draw links
      g.selectAll(".link")
        .data(root.links())
        .enter().append("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "#cbd5e1")
        .attr("stroke-width", 1.5)
        .attr("d", d3.linkRadial<d3.HierarchyPointLink<MindMapNode>, d3.HierarchyPointNode<MindMapNode>>()
          .angle(d => d.x)
          .radius(d => d.y)
        );

      // Draw nodes
      const node = g.selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `
          rotate(${d.x * 180 / Math.PI - 90})
          translate(${d.y},0)
        `);

      // Node circles
      node.append("circle")
        .attr("r", d => d.depth === 0 ? 30 : d.depth === 1 ? 20 : 10)
        .attr("fill", d => {
          if (d.depth === 0) return "#10b981"; // Emerald for root
          if (d.depth === 1) return "#3b82f6"; // Blue for categories
          return "#f8fafc"; // White for words
        })
        .attr("stroke", d => d.depth === 2 ? "#94a3b8" : "none")
        .attr("stroke-width", 2)
        .attr("cursor", "pointer")
        .on("click", (event, d) => {
            if(d.depth === 2) {
                setSearchWord(d.data.label);
                setActiveTab('analysis');
                // Auto trigger search?
            }
        });

      // Node labels
      node.append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d.x < Math.PI === !d.children ? 6 : -6)
        .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
        .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
        .text(d => d.data.label)
        .attr("font-size", d => d.depth === 0 ? "16px" : d.depth === 1 ? "14px" : "12px")
        .attr("font-weight", d => d.depth < 2 ? "bold" : "normal")
        .attr("fill", d => d.depth < 2 ? "#1e293b" : "#475569")
        .clone(true).lower()
        .attr("stroke", "white")
        .attr("stroke-width", 3);
    }
  }, [mindMapData, activeTab]);

  // Saved Items State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ correction: '', context: '', category: '' });

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(savedItems.map(item => item.category).filter(Boolean) as string[]);
    return ['All', 'Uncategorized', ...Array.from(cats)];
  }, [savedItems]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return savedItems;
    if (selectedCategory === 'Uncategorized') return savedItems.filter(item => !item.category);
    return savedItems.filter(item => item.category === selectedCategory);
  }, [savedItems, selectedCategory]);

  const handleSaveEdit = (item: SavedItem) => {
    onUpdateItem({ 
      ...item, 
      correction: editForm.correction.trim() || item.correction,
      context: editForm.context.trim() || item.context,
      category: editForm.category.trim() || undefined 
    });
    setEditingItemId(null);
  };

  const startEditing = (item: SavedItem) => {
    setEditingItemId(item.id);
    setEditForm({
      correction: item.correction,
      context: item.context,
      category: item.category || ''
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Header Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 pt-4 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'analysis' 
              ? 'border-emerald-500 text-emerald-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen size={18} />
          Morphological Analysis
        </button>
        <button
          onClick={() => setActiveTab('mindmap')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'mindmap' 
              ? 'border-emerald-500 text-emerald-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Network size={18} />
          Topic Mind Map
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'saved' 
              ? 'border-emerald-500 text-emerald-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Library size={18} />
          Saved Items
          <span className="ml-1 bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">
            {savedItems.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('practice')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'practice' 
              ? 'border-emerald-500 text-emerald-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen size={18} />
          Practice
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {error && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Search Bar */}
            <form onSubmit={handleAnalyze} className="relative">
              <input
                type="text"
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                placeholder="Enter a word to analyze (e.g., sympathy, unachievable)..."
                className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 shadow-sm text-lg"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
              <button
                type="submit"
                disabled={isAnalyzing || !searchWord.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : 'Analyze'}
              </button>
            </form>

            {/* Results */}
            {analysisResult && !isAnalyzing && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header Card */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
                        {analysisResult.word}
                      </h1>
                      <div className="flex items-center gap-3 text-slate-500">
                        <span className="font-mono text-lg bg-slate-100 px-2 py-1 rounded-md">
                          /{analysisResult.phonetic}/
                        </span>
                        <button 
                          onClick={() => playAudio(analysisResult.word)}
                          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-emerald-600"
                        >
                          <Volume2 size={20} />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-medium text-emerald-600 bg-emerald-50 px-4 py-2 rounded-2xl inline-block">
                        {analysisResult.translation}
                      </div>
                    </div>
                  </div>

                  {/* Morphological Equation */}
                  <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Morphological Breakdown</h3>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-lg md:text-xl font-medium">
                      {analysisResult.morphology.prefix && (
                        <div className="flex flex-col items-center">
                          <span className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                            {analysisResult.morphology.prefix.morpheme}
                          </span>
                          <span className="text-xs text-slate-500 mt-1">{analysisResult.morphology.prefix.meaning}</span>
                        </div>
                      )}
                      
                      {analysisResult.morphology.prefix && <span className="text-slate-300">+</span>}
                      
                      <div className="flex flex-col items-center">
                        <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 font-bold">
                          {analysisResult.morphology.root.morpheme}
                        </span>
                        <span className="text-xs text-slate-500 mt-1">{analysisResult.morphology.root.meaning} ({analysisResult.morphology.root.origin})</span>
                      </div>

                      {analysisResult.morphology.suffix && <span className="text-slate-300">+</span>}

                      {analysisResult.morphology.suffix && (
                        <div className="flex flex-col items-center">
                          <span className="text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">
                            {analysisResult.morphology.suffix.morpheme}
                          </span>
                          <span className="text-xs text-slate-500 mt-1">{analysisResult.morphology.suffix.meaning}</span>
                        </div>
                      )}

                      <span className="text-slate-300 mx-2">=</span>
                      <span className="font-bold text-slate-800">{analysisResult.word}</span>
                    </div>
                  </div>
                </div>

                {/* Context & Examples */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Contextual Usage</h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                        <div className="text-xs font-bold text-emerald-600 uppercase mb-1">Positive Context</div>
                        <p className="text-slate-800 font-medium mb-1">{analysisResult.contextualEmbedding.positiveExample.en}</p>
                        <p className="text-sm text-slate-500">{analysisResult.contextualEmbedding.positiveExample.vn}</p>
                      </div>
                      
                      <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100">
                        <div className="text-xs font-bold text-rose-600 uppercase mb-1">Negative Context</div>
                        <p className="text-slate-800 font-medium mb-1">{analysisResult.contextualEmbedding.negativeExample.en}</p>
                        <p className="text-sm text-slate-500">{analysisResult.contextualEmbedding.negativeExample.vn}</p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Common Collocations</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.contextualEmbedding.collocations.map((col, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Word Network */}
                  <div className="space-y-6">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Word Family</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(analysisResult.derivatives).map(([type, word]) => word && (
                          <div key={type} className="flex flex-col">
                            <span className="text-xs text-slate-400 capitalize">{type}</span>
                            <span className="font-medium text-slate-800">{word}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Synonyms</h3>
                          <ul className="space-y-2">
                            {analysisResult.synonyms.map((syn, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-slate-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                {syn}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Antonyms</h3>
                          <ul className="space-y-2">
                            {analysisResult.antonyms.map((ant, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-slate-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                {ant}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'mindmap' && (
          <div className="h-full flex flex-col">
            <form onSubmit={handleGenerateMap} className="relative max-w-2xl mx-auto w-full mb-6 shrink-0">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a topic (e.g., Environment, Technology)..."
                className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 shadow-sm text-lg"
              />
              <Network className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
              <button
                type="submit"
                disabled={isGeneratingMap || !topic.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isGeneratingMap ? <Loader2 size={18} className="animate-spin" /> : 'Generate Map'}
              </button>
            </form>

            <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden min-h-[500px]">
              {isGeneratingMap ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                  <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
                  <p className="text-slate-600 font-medium">Constructing semantic network...</p>
                </div>
              ) : mindMapData ? (
                <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                  <Network size={64} className="mb-4 opacity-20" />
                  <p>Enter a topic above to generate a vocabulary mind map.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Categories Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Items Grid */}
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
                <Library size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No items found</h3>
                <p className="text-slate-500">
                  {selectedCategory === 'All' 
                    ? "You haven't saved any vocabulary items yet."
                    : `No items found in the "${selectedCategory}" category.`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col">
                    {editingItemId === item.id ? (
                      <div className="flex flex-col h-full space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Word / Phrase</label>
                          <input
                            type="text"
                            value={editForm.correction}
                            onChange={(e) => setEditForm({ ...editForm, correction: e.target.value })}
                            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 font-bold text-slate-900"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Context</label>
                          <textarea
                            value={editForm.context}
                            onChange={(e) => setEditForm({ ...editForm, context: e.target.value })}
                            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 resize-none h-20"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                          <input
                            type="text"
                            value={editForm.category}
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                            placeholder="e.g., Business, Travel..."
                            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2 mt-auto">
                          <button
                            onClick={() => setEditingItemId(null)}
                            className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(item)}
                            className="px-3 py-1.5 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <Check size={14} />
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-slate-900">{item.correction}</h4>
                            {item.original !== item.correction && (
                              <p className="text-sm text-slate-500 line-through">{item.original}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => startEditing(item)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Edit item"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => onDeleteItem(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-slate-700 mb-4 flex-1 italic">"{item.context}"</p>
                        
                        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                            <Tag size={12} />
                            {item.category || 'Uncategorized'}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'practice' && (
          <VocabPractice savedItems={savedItems} />
        )}
      </div>
    </div>
  );
};

export default VocabHub;
