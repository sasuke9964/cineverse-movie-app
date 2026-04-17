import React, { useState, useCallback } from "react";
import { useFavorites } from "../../context/FavoritesContext";
import "./MovieCard.css";

// Placeholder shown when a movie has no poster in OMDB
const POSTER_PLACEHOLDER =
  "https://placehold.co/300x450/1a1a2e/e94560?text=No+Poster";

/**
 * MovieCard
 * Renders a single movie tile with poster, hover overlay, rating badge,
 * and a ♥ favorites toggle.
 *
 * Expected movie shape (normalised by src/api/omdb.js):
 *   id, title, poster (direct URL | null), year, rating (0-10 | null), overview
 */
function MovieCard({ movie, onSelect }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [imgError, setImgError] = useState(false);

  const favorited = isFavorite(movie.id);

  // OMDB gives a direct poster URL — no base-URL prefix needed
  const posterSrc =
    imgError || !movie.poster ? POSTER_PLACEHOLDER : movie.poster;

  // Colour-code the IMDB rating badge (10-point scale matches TMDB)
  const ratingDisplay = movie.rating ? movie.rating.toFixed(1) : null;
  const ratingClass =
    movie.rating >= 7
      ? "rating--high"
      : movie.rating >= 5
      ? "rating--mid"
      : movie.rating
      ? "rating--low"
      : "";

  const handleFavorite = useCallback(
    (e) => {
      e.stopPropagation();
      toggleFavorite(movie);
    },
    [toggleFavorite, movie]
  );

  return (
    <article
      className="movie-card"
      onClick={() => onSelect(movie.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect(movie.id)}
      aria-label={`View details for ${movie.title}`}
    >
      {/* Poster */}
      <div className="movie-card__poster-wrap">
        <img
          className="movie-card__poster"
          src={posterSrc}
          alt={`${movie.title} poster`}
          onError={() => setImgError(true)}
          loading="lazy"
        />

        {/* Hover overlay */}
        <div className="movie-card__overlay">
          <p className="movie-card__overview">
            {movie.overview
              ? movie.overview.slice(0, 120) +
                (movie.overview.length > 120 ? "…" : "")
              : "Click to view details."}
          </p>
          <button className="movie-card__btn-details">View Details</button>
        </div>

        {/* Heart button */}
        <button
          className={`movie-card__fav-btn ${favorited ? "favorited" : ""}`}
          onClick={handleFavorite}
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          title={favorited ? "Remove from favorites" : "Add to favorites"}
        >
          {favorited ? "♥" : "♡"}
        </button>

        {/* Rating badge — hidden if no rating available */}
        {ratingDisplay && (
          <span className={`movie-card__rating ${ratingClass}`}>
            ★ {ratingDisplay}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="movie-card__info">
        <h3 className="movie-card__title">{movie.title}</h3>
        <span className="movie-card__year">{movie.year}</span>
      </div>
    </article>
  );
}

export default React.memo(MovieCard);
