// src/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: '/api/', // thanks to proxy in package.json this maps to http://127.0.0.1:8000/api/
});

export default API;
