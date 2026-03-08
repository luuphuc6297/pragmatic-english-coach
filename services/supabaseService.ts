import { supabase } from '../lib/supabase';
import { ConversationHistory, SavedItem } from '../types';

export interface AppState {
  hasOnboarded: boolean;
  userPreferences: any;
  completedLessons: string[];
  scoreHistory: number[];
  savedItems: any[];
  conversationHistory: any[];
  currentSession: any;
}

export const supabaseService = {
  async saveState(userId: string, state: AppState) {
    if (userId.startsWith('guest-')) {
      localStorage.setItem(`pragmatic_state_${userId}`, JSON.stringify(state));
      return;
    }
    try {
      const { error } = await supabase
        .from('app_state')
        .upsert({ user_id: userId, state, updated_at: new Date().toISOString() });
      
      if (error) {
        console.error('Error saving state to Supabase:', error);
        localStorage.setItem(`pragmatic_state_${userId}`, JSON.stringify(state));
      }
    } catch (err) {
      console.error('Failed to save state:', err);
      localStorage.setItem(`pragmatic_state_${userId}`, JSON.stringify(state));
    }
  },

  async loadState(userId: string): Promise<AppState | null> {
    if (userId.startsWith('guest-')) {
      const local = localStorage.getItem(`pragmatic_state_${userId}`);
      return local ? JSON.parse(local) : null;
    }
    try {
      const { data, error } = await supabase
        .from('app_state')
        .select('state')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // Not found
          console.error('Error loading state from Supabase:', error);
        }
        const local = localStorage.getItem(`pragmatic_state_${userId}`);
        return local ? JSON.parse(local) : null;
      }

      return data?.state as AppState;
    } catch (err) {
      console.error('Failed to load state:', err);
      const local = localStorage.getItem(`pragmatic_state_${userId}`);
      return local ? JSON.parse(local) : null;
    }
  },

  async syncHistory(userId: string, history: ConversationHistory[]) {
    if (!history || history.length === 0) return;
    
    if (userId.startsWith('guest-')) {
      localStorage.setItem(`pragmatic_history_${userId}`, JSON.stringify(history));
      return;
    }
    
    try {
      // Format data for upsert
      const historyData = history.map(item => ({
        user_id: userId,
        conversation_id: item.id,
        mode: item.mode,
        title: item.title,
        messages: item.messages,
        context: item.context || null,
        timestamp: item.timestamp,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('conversation_history')
        .upsert(historyData, { onConflict: 'user_id, conversation_id' });

      if (error) {
        if (error.code !== 'PGRST205') {
          console.error('Error syncing history to Supabase:', error);
        }
        localStorage.setItem(`pragmatic_history_${userId}`, JSON.stringify(history));
      }
    } catch (err) {
      console.error('Failed to sync history:', err);
      localStorage.setItem(`pragmatic_history_${userId}`, JSON.stringify(history));
    }
  },

  async loadHistory(userId: string): Promise<ConversationHistory[]> {
    if (userId.startsWith('guest-')) {
      const local = localStorage.getItem(`pragmatic_history_${userId}`);
      return local ? JSON.parse(local) : [];
    }
    try {
      const { data, error } = await supabase
        .from('conversation_history')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) {
        if (error.code !== 'PGRST205') { // Ignore "table not found" error
          console.error('Error loading history from Supabase:', error);
        }
        const local = localStorage.getItem(`pragmatic_history_${userId}`);
        return local ? JSON.parse(local) : [];
      }

      return data.map(item => ({
        id: item.conversation_id,
        mode: item.mode as any,
        title: item.title,
        messages: item.messages,
        context: item.context,
        timestamp: item.timestamp
      }));
    } catch (err) {
      console.error('Failed to load history:', err);
      const local = localStorage.getItem(`pragmatic_history_${userId}`);
      return local ? JSON.parse(local) : [];
    }
  },

  async syncSavedItems(userId: string, items: SavedItem[]) {
    if (!items || items.length === 0) return;
    
    if (userId.startsWith('guest-')) {
      localStorage.setItem(`pragmatic_items_${userId}`, JSON.stringify(items));
      return;
    }

    try {
      const itemsData = items.map(item => ({
        user_id: userId,
        item_id: item.id,
        original: item.original,
        correction: item.correction,
        type: item.type,
        context: item.context,
        timestamp: item.timestamp,
        mastery_score: item.masteryScore,
        explanation: item.explanation || null,
        examples: item.examples || null,
        part_of_speech: item.partOfSpeech || null,
        next_review_date: item.nextReviewDate || null,
        interval: item.interval || null,
        ease_factor: item.easeFactor || null,
        review_count: item.reviewCount || null,
        category: item.category || null,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('saved_items')
        .upsert(itemsData, { onConflict: 'user_id, item_id' });

      if (error) {
        if (error.code !== 'PGRST205') {
          console.error('Error syncing saved items to Supabase:', error);
        }
        localStorage.setItem(`pragmatic_items_${userId}`, JSON.stringify(items));
      }
    } catch (err) {
      console.error('Failed to sync saved items:', err);
      localStorage.setItem(`pragmatic_items_${userId}`, JSON.stringify(items));
    }
  },

  async loadSavedItems(userId: string): Promise<SavedItem[]> {
    if (userId.startsWith('guest-')) {
      const local = localStorage.getItem(`pragmatic_items_${userId}`);
      return local ? JSON.parse(local) : [];
    }
    try {
      const { data, error } = await supabase
        .from('saved_items')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) {
        if (error.code !== 'PGRST205') { // Ignore "table not found" error
          console.error('Error loading saved items from Supabase:', error);
        }
        const local = localStorage.getItem(`pragmatic_items_${userId}`);
        return local ? JSON.parse(local) : [];
      }

      return data.map(item => ({
        id: item.item_id,
        original: item.original,
        correction: item.correction,
        type: item.type as any,
        context: item.context,
        timestamp: item.timestamp,
        masteryScore: item.mastery_score,
        explanation: item.explanation,
        examples: item.examples,
        partOfSpeech: item.part_of_speech,
        nextReviewDate: item.next_review_date,
        interval: item.interval,
        easeFactor: item.ease_factor,
        reviewCount: item.review_count,
        category: item.category
      }));
    } catch (err) {
      console.error('Failed to load saved items:', err);
      const local = localStorage.getItem(`pragmatic_items_${userId}`);
      return local ? JSON.parse(local) : [];
    }
  }
};
