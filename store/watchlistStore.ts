import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  addedAt: string;
}

export interface Watchlist {
  id: string;
  name: string;
  items: WatchlistItem[];
  createdAt: string;
}

interface WatchlistStore {
  watchlists: Watchlist[];
  
  // Actions
  createWatchlist: (name: string) => string;
  deleteWatchlist: (watchlistId: string) => void;
  addToWatchlist: (watchlistId: string, item: Omit<WatchlistItem, 'id' | 'addedAt'>) => void;
  removeFromWatchlist: (watchlistId: string, itemId: string) => void;
  isStockInWatchlist: (symbol: string) => boolean;
  getWatchlistsForStock: (symbol: string) => Watchlist[];
  renameWatchlist: (watchlistId: string, newName: string) => void;
}

export const useWatchlistStore = create<WatchlistStore>()(
  persist(
    (set, get) => ({
      watchlists: [],

      createWatchlist: (name: string) => {
        const newWatchlist: Watchlist = {
          id: Date.now().toString(),
          name,
          items: [],
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          watchlists: [...state.watchlists, newWatchlist],
        }));
        
        return newWatchlist.id;
      },

      deleteWatchlist: (watchlistId: string) => {
        set((state) => ({
          watchlists: state.watchlists.filter((w) => w.id !== watchlistId),
        }));
      },

      addToWatchlist: (watchlistId: string, item: Omit<WatchlistItem, 'id' | 'addedAt'>) => {
        set((state) => ({
          watchlists: state.watchlists.map((watchlist) =>
            watchlist.id === watchlistId
              ? {
                  ...watchlist,
                  items: [
                    ...watchlist.items.filter((i) => i.symbol !== item.symbol),
                    {
                      ...item,
                      id: Date.now().toString(),
                      addedAt: new Date().toISOString(),
                    },
                  ],
                }
              : watchlist
          ),
        }));
      },

      removeFromWatchlist: (watchlistId: string, itemId: string) => {
        set((state) => ({
          watchlists: state.watchlists.map((watchlist) =>
            watchlist.id === watchlistId
              ? {
                  ...watchlist,
                  items: watchlist.items.filter((item) => item.id !== itemId),
                }
              : watchlist
          ),
        }));
      },

      isStockInWatchlist: (symbol: string) => {
        const { watchlists } = get();
        return watchlists.some((watchlist) =>
          watchlist.items.some((item) => item.symbol === symbol)
        );
      },

      getWatchlistsForStock: (symbol: string) => {
        const { watchlists } = get();
        return watchlists.filter((watchlist) =>
          watchlist.items.some((item) => item.symbol === symbol)
        );
      },

      renameWatchlist: (watchlistId: string, newName: string) => {
        set((state) => ({
          watchlists: state.watchlists.map((watchlist) =>
            watchlist.id === watchlistId
              ? { ...watchlist, name: newName }
              : watchlist
          ),
        }));
      },
    }),
    {
      name: 'watchlist-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);