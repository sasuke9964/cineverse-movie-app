import React from "react";
import { useFavorites } from "../../context/FavoritesContext";
import MovieGrid from "../../components/MovieGrid/MovieGrid";
import "./FavoritesPage.css";

/**
 * FavoritesPage
 * Displays movies saved to localStorage via the FavoritesContext.
 * Allows clearing all favorites at once.
 */
function FavoritesPage({ onMovieSelect }) {
  const { favorites, clearFavorites } = useFavorites();

  return (
    <main className="favorites-page">
      {/* Header */}
      <div className="favorites-header">
        <div>
          <h1 className="favorites-title">❤️ My Favorites</h1>
          <p className="favorites-subtitle">
            {favorites.length === 0
              ? "You haven't added any favorites yet."
              : `${favorites.length} movie${favorites.length !== 1 ? "s" : ""} saved`}
          </p>
        </div>
        {favorites.length > 0 && (
          <button className="btn-clear-all" onClick={clearFavorites}>
            Clear All
          </button>
        )}
      </div>

      {/* Grid (no load-more — all are stored locally) */}
      <MovieGrid
        movies={favorites}
        loading={false}
        error={null}
        onSelect={onMovieSelect}
        onLoadMore={null}
        hasMore={false}
      />
    </main>
  );
}

export default FavoritesPage;
