import React from "react";
import MovieCard from "../MovieCard/MovieCard";
import Spinner from "../Spinner/Spinner";
import "./MovieGrid.css";

/**
 * MovieGrid
 * Responsible for rendering a responsive grid of MovieCards.
 * Also handles loading skeletons and error / empty states.
 */
function MovieGrid({ movies, loading, error, onSelect, onLoadMore, hasMore }) {
  if (error) {
    return (
      <div className="movie-grid__state">
        <span className="movie-grid__icon">⚠️</span>
        <p className="movie-grid__msg">{error}</p>
      </div>
    );
  }

  if (!loading && movies.length === 0) {
    return (
      <div className="movie-grid__state">
        <span className="movie-grid__icon">🎬</span>
        <p className="movie-grid__msg">No movies found. Try a different search.</p>
      </div>
    );
  }

  return (
    <section className="movie-grid-wrapper">
      <div className="movie-grid">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} onSelect={onSelect} />
        ))}

        {/* Loading skeleton cards while fetching */}
        {loading &&
          Array.from({ length: 8 }).map((_, i) => (
            <div key={`sk-${i}`} className="movie-card skeleton">
              <div className="skeleton__poster" />
              <div className="skeleton__info">
                <div className="skeleton__line" />
                <div className="skeleton__line skeleton__line--short" />
              </div>
            </div>
          ))}
      </div>

      {/* Load more button */}
      {!loading && hasMore && onLoadMore && (
        <div className="movie-grid__load-more">
          <button className="btn-load-more" onClick={onLoadMore}>
            Load More
          </button>
        </div>
      )}

      {loading && movies.length > 0 && (
        <div className="movie-grid__load-more">
          <Spinner size="small" />
        </div>
      )}
    </section>
  );
}

export default MovieGrid;
