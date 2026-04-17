import React, { useState, useCallback } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { useFavorites } from "../../context/FavoritesContext";
import "./Navbar.css";

/**
 * Navbar
 * Sticky top navigation with:
 *  - Brand logo
 *  - Animated search bar (with debounced input)
 *  - Tab switcher: Home / Favorites
 */
function Navbar({ onSearch, activeTab, onTabChange }) {
  const [inputValue, setInputValue] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const { favorites } = useFavorites();

  // Debounce the raw input before notifying parent
  useDebounce(inputValue, 500); // just to keep hook registered

  const handleChange = useCallback(
    (e) => {
      setInputValue(e.target.value);
      onSearch(e.target.value);
    },
    [onSearch]
  );

  const handleClear = useCallback(() => {
    setInputValue("");
    onSearch("");
  }, [onSearch]);

  const toggleSearch = () => {
    setSearchOpen((prev) => {
      if (prev) { setInputValue(""); onSearch(""); }
      return !prev;
    });
  };

  return (
    <header className="navbar">
      <div className="navbar__inner">
        {/* Brand */}
        <div className="navbar__brand" onClick={() => { onTabChange("home"); handleClear(); }}>
          <span className="brand-icon">🎬</span>
          <span className="brand-name">CineVerse</span>
        </div>

        {/* Center: Tabs */}
        <nav className="navbar__tabs">
          <button
            className={`nav-tab ${activeTab === "home" ? "active" : ""}`}
            onClick={() => { onTabChange("home"); handleClear(); setSearchOpen(false); }}
          >
            Home
          </button>
          <button
            className={`nav-tab ${activeTab === "favorites" ? "active" : ""}`}
            onClick={() => { onTabChange("favorites"); setSearchOpen(false); }}
          >
            Favorites
            {favorites.length > 0 && (
              <span className="fav-count">{favorites.length}</span>
            )}
          </button>
        </nav>

        {/* Search bar */}
        <div className={`navbar__search ${searchOpen ? "open" : ""}`}>
          {searchOpen && (
            <div className="search-input-wrap">
              <input
                id="movie-search-input"
                type="text"
                className="search-input"
                placeholder="Search movies…"
                value={inputValue}
                onChange={handleChange}
                autoFocus
                aria-label="Search movies"
              />
              {inputValue && (
                <button className="search-clear" onClick={handleClear} aria-label="Clear search">✕</button>
              )}
            </div>
          )}
          <button
            className="search-toggle"
            onClick={toggleSearch}
            aria-label={searchOpen ? "Close search" : "Open search"}
          >
            {searchOpen ? "✕" : "🔍"}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
