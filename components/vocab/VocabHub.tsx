import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, Loader2, Network, BookOpen, Volume2, Plus, ArrowRight, X, Library, Tag, Trash2, Edit2, Check, AlertCircle, Download } from 'lucide-react';
import { CEFRLevel, SavedItem } from '../../types';
import { getMasteryBarClass } from '../../configs/themeConfig';
import { generateWordAnalysis, WordAnalysis, generateTopicMindMap, MindMapNode, expandMindMapNode, analyzeCustomNode } from '../../services/geminiService';
import * as d3 from 'd3';
import VocabPractice from './VocabPractice';

import Flashcards from './Flashcards';

interface VocabHubProps {
  userLevel: CEFRLevel;
  savedItems: SavedItem[];
  onUpdateItem: (item: SavedItem) => void;
  onDeleteItem: (id: string) => void;
}

const VocabHub: React.FC<VocabHubProps> = ({ userLevel, savedItems, onUpdateItem, onDeleteItem }) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'mindmap' | 'saved' | 'practice' | 'flashcards'>('analysis');
  
  // Analysis State
  const [searchWord, setSearchWord] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<WordAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mind Map State
  const [topic, setTopic] = useState('');
  const [isGeneratingMap, setIsGeneratingMap] = useState(false);
  const [mindMapData, setMindMapData] = useState<MindMapNode | null>(null);
  const [expandingNodeId, setExpandingNodeId] = useState<string | null>(null);
  const [customNodeWord, setCustomNodeWord] = useState('');
  const [isAddingCustomNode, setIsAddingCustomNode] = useState(false);
  const [customNodeMessage, setCustomNodeMessage] = useState<{type: 'success' | 'error' | 'warning', text: string} | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const analyzeWord = useCallback(async (word: string) => {
    if (!word.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await generateWordAnalysis(word.trim());
      setAnalysisResult(result);
    } catch (err) {
      setError("Failed to analyze word. Please try again.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    await analyzeWord(searchWord);
  };

  const handleGenerateMap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGeneratingMap(true);
    setError(null);
    setCustomNodeMessage(null);
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

  const handleExpandNode = async (nodeId: string, nodeLabel: string) => {
    if (!mindMapData) return;
    setExpandingNodeId(nodeId);
    setError(null);
    setCustomNodeMessage(null);
    try {
      const newChildren = await expandMindMapNode(nodeLabel, topic, userLevel);
      
      // Deep clone and update mindMapData
      const updateNode = (node: MindMapNode): MindMapNode => {
        if (node.id === nodeId) {
          return { ...node, children: [...(node.children || []), ...newChildren] };
        }
        if (node.children) {
          return { ...node, children: node.children.map(updateNode) };
        }
        return node;
      };
      
      setMindMapData(updateNode(mindMapData));
    } catch (err) {
      setError("Failed to expand node. Please try again.");
      console.error(err);
    } finally {
      setExpandingNodeId(null);
    }
  };

  const handleAddCustomNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNodeWord.trim() || !mindMapData) return;

    setIsAddingCustomNode(true);
    setCustomNodeMessage(null);
    try {
      const result = await analyzeCustomNode(customNodeWord.trim(), mindMapData);
      
      if (result.status === 'connected' && result.parentNodeId) {
        // Add node to the tree
        const newNode: MindMapNode = {
          id: `custom-${Date.now()}`,
          label: customNodeWord.trim(),
          type: 'word',
          translation: result.translation,
          partOfSpeech: result.partOfSpeech,
          context: result.context
        };

        const updateNode = (node: MindMapNode): MindMapNode => {
          if (node.id === result.parentNodeId) {
            return { ...node, children: [...(node.children || []), newNode] };
          }
          if (node.children) {
            return { ...node, children: node.children.map(updateNode) };
          }
          return node;
        };
        
        setMindMapData(updateNode(mindMapData));
        setCustomNodeMessage({ type: 'success', text: `Added "${customNodeWord}" to the mind map!` });
        setCustomNodeWord('');
      } else {
        setCustomNodeMessage({ 
          type: 'warning', 
          text: `"${customNodeWord}" doesn't seem related to the current mind map. You can generate a new mind map for it, or try another word.` 
        });
      }
    } catch (err) {
      setCustomNodeMessage({ type: 'error', text: "Failed to analyze custom node." });
      console.error(err);
    } finally {
      setIsAddingCustomNode(false);
    }
  };

  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  // Helper to format Part of Speech
  const formatPOS = (pos?: string) => {
    if (!pos) return '';
    const p = pos.toLowerCase();
    if (p.includes('noun')) return 'n.';
    if (p.includes('verb')) return 'v.';
    if (p.includes('adj')) return 'adj.';
    if (p.includes('adv')) return 'adv.';
    if (p.includes('prep')) return 'prep.';
    if (p.includes('conj')) return 'conj.';
    if (p.includes('pron')) return 'pron.';
    return p;
  };

  const exportMindMap = () => {
    if (!svgRef.current) return;
    
    const svgElement = svgRef.current;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgElement);
    
    // Add name spaces.
    if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if(!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    // Add xml declaration
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
    
    // Convert svg source to URI data scheme.
    const url = "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(source);
    
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement("canvas");
      canvas.width = svgElement.clientWidth || 800;
      canvas.height = svgElement.clientHeight || 600;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      // Fill white background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.drawImage(img, 0, 0);
      
      const pngUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.download = `mindmap-${topic || 'export'}.png`;
      a.href = pngUrl;
      a.click();
    };
    img.src = url;
  };

  // D3 Mind Map Rendering
  useEffect(() => {
    if (activeTab === 'mindmap' && mindMapData && svgRef.current) {
      const width = svgRef.current.clientWidth || 800;
      const height = svgRef.current.clientHeight || 600;
      
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove(); // Clear previous

      // Add zoom support
      const zoom = d3.zoom().on("zoom", (e) => {
        g.attr("transform", e.transform);
      });
      svg.call(zoom as d3.ZoomBehavior<SVGSVGElement, unknown>);

      const g = svg.append("g").attr("transform", `translate(80,${height / 2})`);

      const root = d3.hierarchy(mindMapData);
      
      // Create a horizontal tree layout
      const treeLayout = d3.tree<MindMapNode>()
        .nodeSize([90, 280]); // height per node, width per level

      treeLayout(root);

      // Center the tree vertically
      let y0 = Infinity;
      let y1 = -Infinity;
      root.each(d => {
        if (d.x > y1) y1 = d.x;
        if (d.x < y0) y0 = d.x;
      });
      
      g.attr("transform", `translate(100, ${height/2 - (y0 + y1)/2})`);

      // Draw links
      const link = g.selectAll(".link")
        .data(root.links())
        .enter().append("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "#cbd5e1")
        .attr("stroke-width", 2)
        .attr("d", d3.linkHorizontal<d3.HierarchyPointLink<MindMapNode>, d3.HierarchyPointNode<MindMapNode>>()
          .x(d => d.y)
          .y(d => d.x)
        );

      // Draw nodes
      const node = g.selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.y},${d.x})`);

      // Drag behavior
      const drag = d3.drag<SVGGElement, d3.HierarchyPointNode<MindMapNode>>()
        .on("start", function(event, d) {
          d3.select(this).raise().classed("active", true);
        })
        .on("drag", function(event, d) {
          d.y += event.dx;
          d.x += event.dy;
          d3.select(this).attr("transform", `translate(${d.y},${d.x})`);
          
          // Update links
          link.filter(l => l.source === d || l.target === d)
            .attr("d", d3.linkHorizontal<d3.HierarchyPointLink<MindMapNode>, d3.HierarchyPointNode<MindMapNode>>()
              .x(l => l.y)
              .y(l => l.x)
            );
        })
        .on("end", function(event, d) {
          d3.select(this).classed("active", false);
        });

      node.call(drag);

      // Node background (rect)
      node.append("rect")
        .attr("rx", 12)
        .attr("ry", 12)
        .attr("x", -20)
        .attr("y", d => d.data.translation ? -30 : -20)
        .attr("width", d => Math.max(180, d.data.label.length * 9 + (d.data.partOfSpeech ? formatPOS(d.data.partOfSpeech).length * 8 : 0) + 40))
        .attr("height", d => d.data.translation ? 60 : 40)
        .attr("fill", d => {
          if (d.depth === 0) return "#10b981"; // Emerald for root
          if (d.depth === 1) return "#3b82f6"; // Blue for level 1
          if (d.depth === 2) return "#8b5cf6"; // Violet for level 2
          return "#f1f5f9"; // Slate 100 for others
        })
        .attr("stroke", d => d.depth > 2 ? "#cbd5e1" : "none")
        .attr("stroke-width", 2)
        .attr("cursor", "grab")
        .attr("class", "shadow-sm transition-all hover:brightness-110")
        .on("click", (event, d) => {
            if (event.defaultPrevented) return; // dragged
            handleExpandNode(d.data.id, d.data.label);
        });

      // Add tooltip for context
      node.append("title")
        .text(d => d.data.context ? `Context: ${d.data.context}` : d.data.label);

      // Node text - Main Word and POS
      node.append("text")
        .attr("dy", d => d.data.translation ? "-0.2em" : "0.32em")
        .attr("x", d => (Math.max(180, d.data.label.length * 9 + (d.data.partOfSpeech ? formatPOS(d.data.partOfSpeech).length * 8 : 0) + 40) / 2) - 20)
        .attr("text-anchor", "middle")
        .text(d => d.data.label + (d.data.partOfSpeech ? ` (${formatPOS(d.data.partOfSpeech)})` : ''))
        .attr("font-family", "Inter, sans-serif")
        .attr("font-size", "14px")
        .attr("font-weight", d => d.depth < 3 ? "600" : "500")
        .attr("fill", d => d.depth < 3 ? "#ffffff" : "#334155")
        .attr("cursor", "grab")
        .style("pointer-events", "none");

      // Node text - Translation
      node.append("text")
        .attr("dy", "1.2em")
        .attr("x", d => (Math.max(180, d.data.label.length * 9 + (d.data.partOfSpeech ? formatPOS(d.data.partOfSpeech).length * 8 : 0) + 40) / 2) - 20)
        .attr("text-anchor", "middle")
        .text(d => d.data.translation || "")
        .attr("font-family", "Inter, sans-serif")
        .attr("font-size", "12px")
        .attr("font-weight", "400")
        .attr("fill", d => d.depth < 3 ? "rgba(255,255,255,0.8)" : "#64748b")
        .attr("cursor", "grab")
        .style("pointer-events", "none");
    }
  }, [mindMapData, activeTab, handleExpandNode]);

  // Saved Items State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ correction: '', context: '', category: '', partOfSpeech: '' });
  const [selectedPOS, setSelectedPOS] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'mastery_asc' | 'mastery_desc'>('newest');

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
    const cats = new Set(savedItems.map(item => item.category).filter(Boolean) as string[]);
    return ['All', 'Uncategorized', ...Array.from(cats)];
  }, [savedItems]);

  const filteredItems = useMemo(() => {
    let items = savedItems;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.correction.toLowerCase().includes(query) || 
        item.original.toLowerCase().includes(query) ||
        item.context.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'All') {
      if (selectedCategory === 'Uncategorized') {
        items = items.filter(item => !item.category);
      } else {
        items = items.filter(item => item.category === selectedCategory);
      }
    }

    if (selectedPOS !== 'All') {
      items = items.filter(item => item.partOfSpeech === selectedPOS);
    }

    // Sort
    items = [...items].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.timestamp - a.timestamp;
        case 'oldest':
          return a.timestamp - b.timestamp;
        case 'mastery_asc':
          return (a.masteryScore || 0) - (b.masteryScore || 0);
        case 'mastery_desc':
          return (b.masteryScore || 0) - (a.masteryScore || 0);
        default:
          return 0;
      }
    });

    return items;
  }, [savedItems, selectedCategory, selectedPOS, searchQuery, sortBy]);

  const handleSaveEdit = (item: SavedItem) => {
    onUpdateItem({ 
      ...item, 
      correction: editForm.correction.trim() || item.correction,
      context: editForm.context.trim() || item.context,
      category: editForm.category.trim() || undefined,
      partOfSpeech: editForm.partOfSpeech.trim() || undefined
    });
    setEditingItemId(null);
  };

  const startEditing = (item: SavedItem) => {
    setEditingItemId(item.id);
    setEditForm({
      correction: item.correction,
      context: item.context,
      category: item.category || '',
      partOfSpeech: item.partOfSpeech || ''
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
        <button
          onClick={() => setActiveTab('flashcards')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'flashcards' 
              ? 'border-emerald-500 text-emerald-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Library size={18} />
          Flashcards
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
            <div className="flex flex-col md:flex-row gap-4 mb-6 shrink-0">
              <form onSubmit={handleGenerateMap} className="relative flex-1">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter a root topic (e.g., Family)..."
                  className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 shadow-sm text-lg"
                />
                <Network className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                <button
                  type="submit"
                  disabled={isGeneratingMap || !topic.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isGeneratingMap ? <Loader2 size={18} className="animate-spin" /> : 'Generate Root'}
                </button>
              </form>

              {mindMapData && (
                <form onSubmit={handleAddCustomNode} className="relative flex-1">
                  <input
                    type="text"
                    value={customNodeWord}
                    onChange={(e) => setCustomNodeWord(e.target.value)}
                    placeholder="Add custom word (e.g., parent in law)..."
                    className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 shadow-sm text-lg"
                  />
                  <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                  <button
                    type="submit"
                    disabled={isAddingCustomNode || !customNodeWord.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isAddingCustomNode ? <Loader2 size={18} className="animate-spin" /> : 'Add Node'}
                  </button>
                </form>
              )}
            </div>

            {customNodeMessage && (
              <div className={`mb-4 p-4 rounded-xl flex items-start gap-3 ${
                customNodeMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                customNodeMessage.type === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">{customNodeMessage.text}</p>
                  {customNodeMessage.type === 'warning' && (
                    <div className="mt-3 flex gap-3">
                      <button 
                        onClick={() => {
                          setTopic(customNodeWord);
                          setCustomNodeMessage(null);
                          setCustomNodeWord('');
                          // Trigger generate map
                          const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                          handleGenerateMap(fakeEvent);
                        }}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Generate new map from "{customNodeWord}"
                      </button>
                      <button 
                        onClick={() => {
                          setCustomNodeMessage(null);
                          setCustomNodeWord('');
                        }}
                        className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-700 border border-amber-200 text-sm font-medium rounded-lg transition-colors"
                      >
                        Reject node
                      </button>
                    </div>
                  )}
                </div>
                <button onClick={() => setCustomNodeMessage(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden min-h-[500px]">
              {mindMapData && !isGeneratingMap && !expandingNodeId && (
                <button
                  onClick={exportMindMap}
                  className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white text-slate-700 border border-slate-200 shadow-sm px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors backdrop-blur-sm"
                  title="Export as Image"
                >
                  <Download size={16} />
                  Export
                </button>
              )}
              {isGeneratingMap ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                  <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
                  <p className="text-slate-600 font-medium">Constructing semantic network...</p>
                </div>
              ) : expandingNodeId ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                  <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
                  <p className="text-slate-600 font-medium">Expanding node...</p>
                </div>
              ) : mindMapData ? (
                <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                  <Network size={64} className="mb-4 opacity-20" />
                  <p>Enter a root topic above to generate a vocabulary mind map.</p>
                  <p className="text-sm mt-2">Click on any node to expand it with more related words!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Filters & Search */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="relative flex-1 w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search saved words, contexts..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="text-xs font-bold text-slate-400 uppercase whitespace-nowrap">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="mastery_desc">Mastery (High to Low)</option>
                    <option value="mastery_asc">Mastery (Low to High)</option>
                  </select>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Categories</h4>
                <div className="flex flex-wrap gap-2">
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
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Part of Speech</h4>
                <div className="flex flex-wrap gap-2">
                  {['All', ...POS_OPTIONS].map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setSelectedPOS(pos)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedPOS === pos
                          ? 'bg-purple-500 text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
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
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Part of Speech</label>
                          <select
                            value={editForm.partOfSpeech}
                            onChange={(e) => setEditForm({ ...editForm, partOfSpeech: e.target.value })}
                            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 bg-white"
                          >
                            <option value="">Select Part of Speech...</option>
                            {POS_OPTIONS.map(pos => (
                              <option key={pos} value={pos}>{pos}</option>
                            ))}
                          </select>
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
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-lg text-slate-900">{item.correction}</h4>
                              {item.partOfSpeech && (
                                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 text-xs font-medium">
                                  {formatPOS(item.partOfSpeech)}
                                </span>
                              )}
                            </div>
                            {item.original !== item.correction && (
                              <p className="text-sm text-slate-500 line-through">{item.original}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => playAudio(item.correction)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Listen"
                            >
                              <Volume2 size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSearchWord(item.correction);
                                setActiveTab('analysis');
                                analyzeWord(item.correction);
                              }}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Analyze Word"
                            >
                              <BookOpen size={16} />
                            </button>
                            <button
                              onClick={() => startEditing(item)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
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
                        
                        {item.explanation && (
                          <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-xs text-slate-600">{item.explanation}</p>
                          </div>
                        )}

                        {item.examples && item.examples.length > 0 && (
                          <div className="mb-4 space-y-2">
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase">Examples</h5>
                            <ul className="space-y-2">
                              {item.examples.slice(0, 2).map((ex, idx) => (
                                <li key={idx} className="text-xs">
                                  <p className="text-slate-700 font-medium">"{ex.en}"</p>
                                  <p className="text-slate-500">{ex.vn}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-3">
                          {/* Mastery Progress */}
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  getMasteryBarClass(item.masteryScore || 0)
                                }`}
                                style={{ width: `${Math.max(5, Math.min(100, item.masteryScore || 0))}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 w-8 text-right">
                              {Math.round(item.masteryScore || 0)}%
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                              <Tag size={12} />
                              {item.category || 'Uncategorized'}
                            </div>
                            {item.nextReviewDate && (
                              <span className="text-[10px] font-medium text-slate-400">
                                Review: {new Date(item.nextReviewDate).toLocaleDateString()}
                              </span>
                            )}
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
          <VocabPractice savedItems={savedItems} onUpdateItem={onUpdateItem} />
        )}

        {activeTab === 'flashcards' && (
          <Flashcards savedItems={savedItems} onUpdateItem={onUpdateItem} />
        )}
      </div>
    </div>
  );
};

export default VocabHub;
