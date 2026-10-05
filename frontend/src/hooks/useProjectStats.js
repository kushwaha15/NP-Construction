import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/api';

/**
 * Fetches live project stats from GET /api/portfolio/stats.
 * Returns { totalProjects, totalTonnage, citiesCovered, byCity, loading, error }.
 *
 * byCity is an array of { city, projects, tonnage } sorted by projects desc.
 * Use getCityProjects(cityName) / getCityTonnage(cityName) for per-city lookups.
 */
export default function useProjectStats() {
  const [state, setState] = useState({
    totalProjects:  null,
    totalTonnage:   null,
    citiesCovered:  null,
    byCity:         [],
    loading:        true,
    error:          null,
  });

  useEffect(() => {
    let cancelled = false;

    axios
      .get(`${API_URL}/api/portfolio/stats`)
      .then(({ data }) => {
        if (cancelled) return;
        setState({
          totalProjects:  data.totalProjects  ?? 0,
          totalTonnage:   data.totalTonnage   ?? 0,
          citiesCovered:  data.citiesCovered  ?? 0,
          byCity:         data.byCity         ?? [],
          loading:        false,
          error:          null,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err.message || 'Failed to load stats',
        }));
      });

    return () => { cancelled = true; };
  }, []);

  /**
   * Returns the project count for a given city name (case-insensitive).
   * Returns null while loading so callers can show a skeleton.
   */
  const getCityProjects = (cityName) => {
    if (state.loading) return null;
    const match = state.byCity.find(
      (entry) => entry.city.toLowerCase() === cityName.toLowerCase()
    );
    return match?.projects ?? 0;
  };

  /**
   * Returns the tonnage for a given city name (case-insensitive).
   * Returns null while loading.
   */
  const getCityTonnage = (cityName) => {
    if (state.loading) return null;
    const match = state.byCity.find(
      (entry) => entry.city.toLowerCase() === cityName.toLowerCase()
    );
    return match?.tonnage ?? 0;
  };

  return { ...state, getCityProjects, getCityTonnage };
}
