// // src/services/api.js
// import axios from "axios";

// const API_URL = "http://localhost:5000/api"; // Backend URL

// export const api = axios.create({
//   baseURL: API_URL,
//   headers: { "Content-Type": "application/json" },
// });

import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});
