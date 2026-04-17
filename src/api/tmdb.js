/**
 * This file is kept only for backward-compatibility during the TMDB → OMDB migration.
 * All real API logic now lives in src/api/omdb.js.
 * New code should import directly from "./omdb".
 */
export {
  OMDB_API_KEY,
  searchMovies,
  getMovieDetails,
  getCuratedMovies,
} from "./omdb";
