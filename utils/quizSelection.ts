import { SavedItem } from '../types';

export const selectNextQuizItem = (savedItems: SavedItem[]): SavedItem => {
    const now = Date.now();
    const dueItems = savedItems.filter(item => (item.nextReviewDate || 0) <= now);

    if (dueItems.length > 0) {
        dueItems.sort((a, b) => (a.nextReviewDate || 0) - (b.nextReviewDate || 0));
        return dueItems[0];
    }

    const sortedByMastery = [...savedItems].sort((a, b) => a.masteryScore - b.masteryScore);
    return sortedByMastery[0];
};
