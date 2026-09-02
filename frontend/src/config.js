// In development, this falls back to localhost.
// In production (Vercel), you must set VITE_API_URL in the Vercel dashboard.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
