import { useState, useEffect, useCallback } from "react";

/**
 * useMovieFetch
 * Generic hook for fetching movies from any TMDB endpoint.
 * Handles loading, error, and pagination state.
 *
 * @param {Function} fetchFn  - Async function that accepts a page number
 * @param {any[]}    deps     - Extra dependency array values (triggers re-fetch)
 */
export function useMovieFetch(fetchFn, deps = []) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [page, setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(
    async (pageNum = 1, append = false) => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFn(pageNum);
        setData((prev) => (append ? [...prev, ...result.results] : result.results));
        setTotalPages(result.total_pages);
        setPage(pageNum);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetchFn, ...deps]
  );

  // Initial fetch whenever the fetch function or deps change
  useEffect(() => {
    setData([]);
    fetchData(1, false);
  }, [fetchData]);

  /** Load the next page and append results */
  const loadMore = useCallback(() => {
    if (page < totalPages && !loading) {
      fetchData(page + 1, true);
    }
  }, [page, totalPages, loading, fetchData]);

  return { data, loading, error, page, totalPages, loadMore, refetch: fetchData };
}
