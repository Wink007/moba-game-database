import { API_URL } from '../../config';

export const fetcher = async <T>(endpoint: string): Promise<T> => {
  const res = await fetch(`${API_URL}${endpoint}`);
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data.data || data;
};

/** Raw fetcher — returns the JSON as-is without unwrapping `.data`. */
export const fetcherRaw = async <T>(endpoint: string): Promise<T> => {
  const res = await fetch(`${API_URL}${endpoint}`);
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
};
