import axios from 'axios';

const configuredApiURL = import.meta.env.VITE_API_URL;
const productionApiURL = 'https://e-com-ten-lilac.vercel.app/api';
const apiBaseURL =
  import.meta.env.PROD &&
  (!configuredApiURL || configuredApiURL === '/api' || configuredApiURL === '/api/')
    ? productionApiURL
    : configuredApiURL || '/api';

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
