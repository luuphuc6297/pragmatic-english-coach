import { useState, useEffect } from 'react';
import { SavedItem, ConversationHistory, AppUser, AppState } from '../types';
import { supabaseService } from '../services/supabaseService';

type DataLoadedCallback = (
    state: AppState | null,
    history: ConversationHistory[],
    items: SavedItem[]
) => void;

export const useDataLoader = (
    user: AppUser | null,
    authLoading: boolean,
    onDataLoaded: DataLoadedCallback
) => {
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (user) {
                const [state, history, items] = await Promise.all([
                    supabaseService.loadState(user.id),
                    supabaseService.loadHistory(user.id),
                    supabaseService.loadSavedItems(user.id)
                ]);
                onDataLoaded(state, history, items);
            }
            setIsDataLoaded(true);
        };

        if (user) {
            loadData();
        } else if (!authLoading) {
            setIsDataLoaded(true);
        }
    }, [user, authLoading]);

    return { isDataLoaded };
};
