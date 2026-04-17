// ============================================================
// OMDB API Configuration
// ------------------------------------------------------------
// Getting your FREE OMDB API key (no login required):
// 1. Go to https://www.omdbapi.com/apikey.aspx
// 2. Select the FREE tier (1,000 daily requests)
// 3. Enter only your email address — no password, no account
// 4. Click the activation link sent to your email
// 5. Paste your key below
// ============================================================

export const OMDB_API_KEY = "YOUR_API_KEY"; // <-- paste your key here
const BASE_URL = "https://www.omdbapi.com/";

// ─────────────────────────────────────────────────────────────
// Curated IMDb ID lists — used for homepage "sections"
// (OMDB has no trending/popular endpoints, so we curate them)
// ─────────────────────────────────────────────────────────────

const CURATED = {
  // Greatest films of all time (IMDb Top 250 selections)
  featured: [
    "tt0111161", // The Shawshank Redemption
    "tt0068646", // The Godfather
    "tt0468569", // The Dark Knight
    "tt0071562", // The Godfather Part II
    "tt0050083", // 12 Angry Men
    "tt0108052", // Schindler's List
    "tt0167260", // LOTR: Return of the King
    "tt0110912", // Pulp Fiction
    "tt0060196", // The Good, the Bad and the Ugly
    "tt0137523", // Fight Club
    "tt0109830", // Forrest Gump
    "tt1375666", // Inception
    "tt0120737", // LOTR: The Fellowship of the Ring
    "tt0167261", // LOTR: The Two Towers
    "tt0080684", // The Empire Strikes Back
    "tt0133093", // The Matrix
    "tt0099685", // Goodfellas
    "tt0073486", // One Flew Over the Cuckoo's Nest
    "tt0114369", // Se7en
    "tt0317248", // City of God
  ],
  // Action & Adventure blockbusters
  action: [
    "tt4154796", // Avengers: Endgame
    "tt4154756", // Avengers: Infinity War
    "tt0848228", // The Avengers
    "tt1392190", // Mad Max: Fury Road
    "tt0372784", // Batman Begins
    "tt1345836", // The Dark Knight Rises
    "tt0082971", // Raiders of the Lost Ark
    "tt0076759", // Star Wars: A New Hope
    "tt0086190", // Return of the Jedi
    "tt3315342", // Logan
    "tt1745960", // Top Gun: Maverick
    "tt0110413", // Léon: The Professional
    "tt0266697", // Kill Bill: Vol. 1
    "tt0120815", // Saving Private Ryan
    "tt2379713", // Sicario
    "tt0401792", // Sin City
    "tt0209144", // Memento
    "tt0102926", // The Silence of the Lambs
    "tt3501632", // Thor: Ragnarok
    "tt6751668", // Parasite
  ],
  // Science-Fiction & Fantasy
  scifi: [
    "tt0816692", // Interstellar
    "tt1856101", // Blade Runner 2049
    "tt0083658", // Blade Runner
    "tt0062622", // 2001: A Space Odyssey
    "tt0910970", // WALL·E
    "tt0246578", // Donnie Darko
    "tt0482571", // The Prestige
    "tt0119177", // Gattaca
    "tt0088763", // Back to the Future
    "tt0096874", // Back to the Future Part II
    "tt2084970", // The Imitation Game
    "tt0470752", // Ex Machina
    "tt1160419", // Dune (2021)
    "tt4729430", // Doctor Strange
    "tt0381681", // Before Sunset
    "tt3783958", // La La Land
    "tt4975722", // Moonlight
    "tt2582802", // Whiplash
    "tt5580390", // The Shape of Water
    "tt3659388", // The Martian
  ],
};

const PAGE_SIZE = 10; // movies per "page" in curated lists

// ─────────────────────────────────────────────────────────────
// Internal response normaliser
// Converts raw OMDB data → consistent internal shape used by
// all components. Components never touch raw OMDB fields.
// ─────────────────────────────────────────────────────────────

/**
 * Normalise a lightweight item (search result OR short detail lookup).
 * Only fields available from both search results and detail calls.
 */
function normaliseItem(item) {
  const rating =
    item.imdbRating && item.imdbRating !== "N/A"
      ? parseFloat(item.imdbRating)
      : null;

  return {
    id: item.imdbID,
    title: item.Title || "Untitled",
    poster: item.Poster && item.Poster !== "N/A" ? item.Poster : null,
    year: item.Year || "—",
    rating,                           // null for bare search results
    overview: item.Plot && item.Plot !== "N/A" ? item.Plot : null,
    // Preserve raw fields for FavoritesContext lightweight snapshot
    imdbID: item.imdbID,
  };
}

/**
 * Normalise a full detail response (from ?i=... call).
 * Adds all the extended fields used by MovieModal.
 */
function normaliseDetail(d) {
  const base = normaliseItem(d);

  const genres =
    d.Genre && d.Genre !== "N/A"
      ? d.Genre.split(", ").map((g) => g.trim())
      : [];

  const actors =
    d.Actors && d.Actors !== "N/A"
      ? d.Actors.split(", ").map((a) => a.trim())
      : [];

  return {
    ...base,
    rated: d.Rated !== "N/A" ? d.Rated : null,
    released: d.Released !== "N/A" ? d.Released : null,
    runtime: d.Runtime !== "N/A" ? d.Runtime : null,
    genres,
    director: d.Director !== "N/A" ? d.Director : null,
    writers: d.Writer !== "N/A" ? d.Writer : null,
    actors,
    language: d.Language !== "N/A" ? d.Language : null,
    country: d.Country !== "N/A" ? d.Country : null,
    awards: d.Awards !== "N/A" ? d.Awards : null,
    boxOffice: d.BoxOffice !== "N/A" ? d.BoxOffice : null,
    metascore: d.Metascore !== "N/A" ? d.Metascore : null,
    imdbVotes: d.imdbVotes !== "N/A" ? d.imdbVotes : null,
    // All rating sources (IMDb, Rotten Tomatoes, Metacritic)
    ratings: Array.isArray(d.Ratings) ? d.Ratings : [],
    production: d.Production !== "N/A" ? d.Production : null,
  };
}

// ─────────────────────────────────────────────────────────────
// Core fetch wrapper
// ─────────────────────────────────────────────────────────────

/**
 * Fetch from OMDB.  Throws a human-readable error on failure.
 * @param {Object} params — query parameters (excluding apikey)
 */
async function fetchOMDB(params = {}) {
  const url = new URL(BASE_URL);
  url.searchParams.set("apikey", OMDB_API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Network error: ${res.status}`);

  const data = await res.json();

  // OMDB signals errors inline (Response: "False")
  if (data.Response === "False") {
    throw new Error(data.Error || "OMDB returned an error");
  }
  return data;
}

// ─────────────────────────────────────────────────────────────
// Public API functions
// All return { results: NormalisedMovie[], total_pages: number }
// so useMovieFetch works unchanged.
// ─────────────────────────────────────────────────────────────

/**
 * Search movies by title query with pagination (10 results / page).
 */
export async function searchMovies(query, page = 1) {
  try {
    const data = await fetchOMDB({ s: query, type: "movie", page });
    const totalResults = parseInt(data.totalResults, 10) || 0;
    return {
      results: data.Search.map(normaliseItem),
      total_pages: Math.ceil(totalResults / 10),
    };
  } catch (err) {
    // "Movie not found!" is a normal OMDB response for empty search
    if (err.message.includes("not found")) {
      return { results: [], total_pages: 1 };
    }
    throw err;
  }
}

/**
 * Get full, normalised details for a single movie by IMDb ID.
 * Used by MovieModal.
 */
export async function getMovieDetails(imdbID) {
  const data = await fetchOMDB({ i: imdbID, plot: "full" });
  return normaliseDetail(data);
}

/**
 * Fetch a curated section (featured / action / scifi) by page.
 * Calls OMDB individually for each ID (short plot) and returns
 * them in the standard { results, total_pages } shape.
 */
export async function getCuratedMovies(section = "featured", page = 1) {
  const ids = CURATED[section] || CURATED.featured;
  const start = (page - 1) * PAGE_SIZE;
  const pageIds = ids.slice(start, start + PAGE_SIZE);

  // Fetch all IDs in parallel for speed
  const settled = await Promise.allSettled(
    pageIds.map((id) => fetchOMDB({ i: id, plot: "short" }))
  );

  const results = settled
    .filter((r) => r.status === "fulfilled")
    .map((r) => normaliseItem(r.value));

  return {
    results,
    total_pages: Math.ceil(ids.length / PAGE_SIZE),
  };
}
