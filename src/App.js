import React, { useState, useCallback } from "react";
import { FavoritesProvider } from "./context/FavoritesContext";
import Navbar from "./components/Navbar/Navbar";
import HomePage from "./pages/HomePage/HomePage";
import FavoritesPage from "./pages/FavoritesPage/FavoritesPage";
import MovieModal from "./components/MovieModal/MovieModal";
import { OMDB_API_KEY } from "./api/omdb";
import "./App.css";

/**
 * App — Root component
 * Manages:
 *  - Active tab (home / favorites)
 *  - Global search query (passed down to HomePage)
 *  - Selected movie ID (triggers the detail modal)
 */
function App() {
  const [activeTab,     setActiveTab]     = useState("home");
  const [searchQuery,   setSearchQuery]   = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null); // movie id for modal

  // Memoised handlers to prevent unnecessary re-renders in child components
  const handleSearch   = useCallback((q) => setSearchQuery(q), []);
  const handleTabChange= useCallback((tab) => {
    setActiveTab(tab);
    setSearchQuery(""); // clear search when switching tabs
  }, []);
  const handleSelect   = useCallback((id) => setSelectedMovie(id), []);
  const handleClose    = useCallback(() => setSelectedMovie(null), []);

  // ── API key guard ────────────────────────────────────────
  const apiKeyMissing = !OMDB_API_KEY || OMDB_API_KEY === "YOUR_OMDB_API_KEY_HERE";

  return (
    <FavoritesProvider>
      {/* Missing-key banner */}
      {apiKeyMissing && (
        <div className="api-warning">
          <span>⚠️</span>
          <span>
            OMDb API key not configured. Open{" "}
            <code>src/api/omdb.js</code> and replace{" "}
            <code>YOUR_OMDB_API_KEY_HERE</code> with your free key from{" "}
            <a href="https://www.omdbapi.com/apikey.aspx" target="_blank" rel="noreferrer">
              omdbapi.com/apikey.aspx
            </a>
            {" "}(only an email address required — no login).
          </span>
        </div>
      )}

      {/* Top navigation */}
      <Navbar
        onSearch={handleSearch}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Page content */}
      {activeTab === "home" ? (
        <HomePage searchQuery={searchQuery} onMovieSelect={handleSelect} />
      ) : (
        <FavoritesPage onMovieSelect={handleSelect} />
      )}

      {/* Movie detail modal */}
      {selectedMovie && (
        <MovieModal movieId={selectedMovie} onClose={handleClose} />
      )}

      {/* Footer */}
      <footer className="app-footer">
        Built with ❤️ using{" "}
        <a href="https://www.omdbapi.com/" target="_blank" rel="noreferrer">
          OMDb API
        </a>
        . Movie data © their respective owners, sourced via The Open Movie Database.
      </footer>
    </FavoritesProvider>
  );
}

export default App;
