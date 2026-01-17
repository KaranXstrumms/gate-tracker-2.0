// Configuration for API Base URL
// Vercel will set VITE_API_BASE_URL environment variable
// Local development will fallback to http://localhost:5001

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export default API_BASE_URL;
