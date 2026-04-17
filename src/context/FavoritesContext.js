import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────
// FavoritesContext
// Provides a global store for favorited movies, persisted in
// localStorage so favorites survive page refreshes.
// ─────────────────────────────────────────────────────────────

const FavoritesContext = createContext(null);

const STORAGE_KEY = "movieapp_favorites";

export function FavoritesProvider({ children }) {
  // Load initial state from localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  /** Check if a movie is favorited by its id */
  const isFavorite = useCallback(
    (movieId) => favorites.some((m) => m.id === movieId),
    [favorites]
  );

  /** Toggle a movie in/out of favorites */
  const toggleFavorite = useCallback((movie) => {
    setFavorites((prev) => {
      const exists = prev.some((m) => m.id === movie.id);
      if (exists) {
        return prev.filter((m) => m.id !== movie.id);
      }
      // Store a lightweight normalised snapshot (OMDB shape)
      return [
        ...prev,
        {
          id: movie.id,
          title: movie.title,
          poster: movie.poster || null,   // direct URL from OMDB
          year: movie.year || "—",
          rating: movie.rating || null,   // IMDB rating 0-10
          overview: movie.overview || null,
        },
      ];
    });
  }, []);

  /** Remove all favorites */
  const clearFavorites = useCallback(() => setFavorites([]), []);

  return (
    <FavoritesContext.Provider
      value={{ favorites, isFavorite, toggleFavorite, clearFavorites }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

/** Custom hook — throws if used outside provider */
export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return ctx;
}
