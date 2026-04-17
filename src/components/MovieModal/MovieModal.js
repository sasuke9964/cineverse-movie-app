import React, { useState, useEffect, useCallback } from "react";
import { getMovieDetails } from "../../api/omdb";
import { useFavorites } from "../../context/FavoritesContext";
import Spinner from "../Spinner/Spinner";
import "./MovieModal.css";

const POSTER_PLACEHOLDER =
  "https://placehold.co/300x450/1a1a2e/e94560?text=No+Poster";

/**
 * MovieModal
 * Full-screen detail overlay powered by the OMDB ?i= endpoint.
 * Shows: poster, title, genres, ratings (IMDb / RT / Metacritic),
 *        plot, cast, director, box office, awards.
 */
function MovieModal({ movieId, onClose }) {
  const [movie, setMovie]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  // Fetch full details when the modal opens or movieId changes
  useEffect(() => {
    if (!movieId) return;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getMovieDetails(movieId);
        if (!cancelled) { setMovie(data); setLoading(false); }
      } catch (err) {
        if (!cancelled) { setError(err.message); setLoading(false); }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [movieId]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleBackdropClick = useCallback(
    (e) => { if (e.target === e.currentTarget) onClose(); },
    [onClose]
  );

  // ── Rating source → colour mapping ──────────────────────────
  const SOURCE_META = {
    "Internet Movie Database": { label: "IMDb",     color: "#f5c518" },
    "Rotten Tomatoes":         { label: "RT",        color: "#fa320a" },
    "Metacritic":              { label: "Metacritic",color: "#62a52d" },
  };

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Movie details"
    >
      <div className="modal-container">
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        {loading && (
          <div className="modal-loading"><Spinner size="large" /></div>
        )}

        {error && (
          <div className="modal-error">
            <p>⚠️ {error}</p>
            <button className="btn-retry" onClick={onClose}>Close</button>
          </div>
        )}

        {!loading && !error && movie && (() => {
          const favorited = isFavorite(movie.id);
          const posterSrc = movie.poster || POSTER_PLACEHOLDER;

          return (
            <div className="modal-content">
              {/* Blurred poster as cinematic backdrop */}
              <div
                className="modal-backdrop-img"
                style={{
                  backgroundImage: `url(${posterSrc})`,
                  filter: "blur(24px) brightness(0.35)",
                  transform: "scale(1.1)",
                }}
              />
              <div className="modal-backdrop-overlay" />

              <div className="modal-body">
                {/* ── Left: Poster ── */}
                <div className="modal-poster-col">
                  <img
                    className="modal-poster"
                    src={posterSrc}
                    alt={`${movie.title} poster`}
                  />

                  <button
                    className={`modal-fav-btn ${favorited ? "favorited" : ""}`}
                    onClick={() => toggleFavorite(movie)}
                  >
                    {favorited ? "♥ Remove Favorite" : "♡ Add to Favorites"}
                  </button>

                  {/* OMDB source ratings */}
                  {movie.ratings.length > 0 && (
                    <div className="modal-ratings-col">
                      {movie.ratings.map((r) => {
                        const meta = SOURCE_META[r.Source] || {
                          label: r.Source,
                          color: "#aaa",
                        };
                        return (
                          <div key={r.Source} className="rating-pill" style={{ "--rc": meta.color }}>
                            <span className="rating-pill__label">{meta.label}</span>
                            <span className="rating-pill__value">{r.Value}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ── Right: Details ── */}
                <div className="modal-details-col">
                  {/* Title + year */}
                  <h1 className="modal-title">{movie.title}</h1>
                  {movie.released && (
                    <p className="modal-tagline">{movie.released}</p>
                  )}

                  {/* Meta chips */}
                  <div className="modal-meta">
                    {movie.year && (
                      <span className="meta-chip">{movie.year}</span>
                    )}
                    {movie.runtime && (
                      <span className="meta-chip">{movie.runtime}</span>
                    )}
                    {movie.rated && (
                      <span className="meta-chip">{movie.rated}</span>
                    )}
                    {movie.rating && (
                      <span className="meta-chip meta-chip--rating">
                        ★ {movie.rating.toFixed(1)} IMDb
                      </span>
                    )}
                    {movie.metascore && (
                      <span className="meta-chip meta-chip--meta">
                        {movie.metascore} Metascore
                      </span>
                    )}
                  </div>

                  {/* Genre tags */}
                  {movie.genres.length > 0 && (
                    <div className="modal-genres">
                      {movie.genres.map((g) => (
                        <span key={g} className="genre-tag">{g}</span>
                      ))}
                    </div>
                  )}

                  {/* Plot */}
                  <h2 className="modal-section-title">Overview</h2>
                  <p className="modal-overview">
                    {movie.overview || "No plot description available."}
                  </p>

                  {/* Director / Writers / Stars */}
                  <div className="modal-stats">
                    {movie.director && (
                      <div className="stat-item">
                        <span className="stat-label">Director</span>
                        <span className="stat-value">{movie.director}</span>
                      </div>
                    )}
                    {movie.writers && (
                      <div className="stat-item">
                        <span className="stat-label">Writers</span>
                        <span className="stat-value">{movie.writers}</span>
                      </div>
                    )}
                  </div>

                  {/* Cast */}
                  {movie.actors.length > 0 && (
                    <>
                      <h2 className="modal-section-title">Cast</h2>
                      <div className="modal-cast-list">
                        {movie.actors.map((actor) => (
                          <span key={actor} className="cast-chip">{actor}</span>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Awards */}
                  {movie.awards && (
                    <>
                      <h2 className="modal-section-title">Awards</h2>
                      <p className="modal-awards">🏆 {movie.awards}</p>
                    </>
                  )}

                  {/* Box Office & Production */}
                  <div className="modal-stats" style={{ marginTop: "1rem" }}>
                    {movie.boxOffice && (
                      <div className="stat-item">
                        <span className="stat-label">Box Office</span>
                        <span className="stat-value">{movie.boxOffice}</span>
                      </div>
                    )}
                    {movie.imdbVotes && (
                      <div className="stat-item">
                        <span className="stat-label">IMDb Votes</span>
                        <span className="stat-value">{movie.imdbVotes}</span>
                      </div>
                    )}
                    {movie.country && (
                      <div className="stat-item">
                        <span className="stat-label">Country</span>
                        <span className="stat-value">{movie.country}</span>
                      </div>
                    )}
                    {movie.language && (
                      <div className="stat-item">
                        <span className="stat-label">Language</span>
                        <span className="stat-value">{movie.language}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default MovieModal;
