import React, { useState, useCallback } from "react";
import {
  getCuratedMovies,
  searchMovies,
} from "../../api/omdb";
import { useMovieFetch } from "../../hooks/useMovieFetch";
import { useDebounce } from "../../hooks/useDebounce";
import MovieGrid from "../../components/MovieGrid/MovieGrid";
import "./HomePage.css";

// ─────────────────────────────────────────────────────────────
// Curated section tabs — backed by hardcoded IMDb ID lists
// inside src/api/omdb.js (no login or trending endpoint needed)
// ─────────────────────────────────────────────────────────────
const TABS = [
  { key: "featured", label: "⭐ All-Time Best" },
  { key: "action",   label: "💥 Action & Adventure" },
  { key: "scifi",    label: "🚀 Sci-Fi & Fantasy" },
];

/**
 * HomePage
 * Switches between:
 *  - Curated sections (All-Time Best / Action / Sci-Fi) via tab buttons
 *  - Live OMDB search results when the user types in the Navbar search bar
 *
 * Search is debounced (400 ms) so we only fire OMDB API calls after
 * the user pauses typing rather than on every keystroke.
 */
function HomePage({ searchQuery, onMovieSelect }) {
  const [activeTab, setActiveTab] = useState("featured");

  // Debounce the raw query — avoids API calls mid-word
  const debouncedQuery = useDebounce(searchQuery, 400);
  const isSearching = Boolean(debouncedQuery.trim());

  // ── Curated section fetch ─────────────────────────────────
  // Re-fetches automatically when activeTab changes (via deps array)
  const curatedFetchFn = useCallback(
    (page) => getCuratedMovies(activeTab, page),
    [activeTab]
  );

  const {
    data: curatedMovies,
    loading: curatedLoading,
    error: curatedError,
    page: curatedPage,
    totalPages: curatedTotalPages,
    loadMore: loadMoreCurated,
  } = useMovieFetch(curatedFetchFn, [activeTab]);

  // ── Search results fetch ──────────────────────────────────
  // Re-fetches every time debouncedQuery changes
  const searchFetchFn = useCallback(
    (page) => searchMovies(debouncedQuery, page),
    [debouncedQuery]
  );

  const {
    data: searchResults,
    loading: searchLoading,
    error: searchError,
    page: searchPage,
    totalPages: searchTotalPages,
    loadMore: loadMoreSearch,
  } = useMovieFetch(searchFetchFn, [debouncedQuery]);

  return (
    <main className="homepage">
      {isSearching ? (
        /* ── Search Results view ── */
        <section>
          <h2 className="section-title">
            Results for <em>"{debouncedQuery}"</em>
            {!searchLoading && (
              <span className="result-count">
                {" "}&mdash; {searchResults.length} movie
                {searchResults.length !== 1 ? "s" : ""}
              </span>
            )}
          </h2>
          <MovieGrid
            movies={searchResults}
            loading={searchLoading}
            error={searchError}
            onSelect={onMovieSelect}
            onLoadMore={loadMoreSearch}
            hasMore={searchPage < searchTotalPages}
          />
        </section>
      ) : (
        /* ── Curated Sections view ── */
        <>
          {/* Animated hero banner */}
          <div className="hero-banner">
            <div className="hero-text">
              <h1 className="hero-title">Discover Amazing Movies</h1>
              <p className="hero-subtitle">
                Powered by OMDb &amp; IMDb data — explore thousands of films
                and save your favourites.
              </p>
            </div>
            <div className="hero-badge">
              <span>🎬</span>
              <span>OMDb API</span>
            </div>
          </div>

          {/* Section tabs */}
          <div className="section-tabs" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                className={`section-tab ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Movie grid for the active curated section */}
          <MovieGrid
            movies={curatedMovies}
            loading={curatedLoading}
            error={curatedError}
            onSelect={onMovieSelect}
            onLoadMore={loadMoreCurated}
            hasMore={curatedPage < curatedTotalPages}
          />
        </>
      )}
    </main>
  );
}

export default HomePage;
