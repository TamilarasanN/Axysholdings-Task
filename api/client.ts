import axios from 'axios';
import { getAccessToken } from '../utils/secureStore';

export const api = axios.create({
  baseURL: 'https://example.auth.api', // replace with real backend or a mock server
  timeout: 15000,
});

let isRefreshing = false;
let queue: {resolve: (t: string) => void; reject: (e: any) => void}[] = [];

function subscribeTokenRefresh(cb: (t: string) => void) {
  queue.push({ resolve: cb, reject: () => {} });
}
function onRrefreshed(token: string) { // deliberate double r to avoid name clash
  queue.forEach(p => p.resolve(token));
  queue = [];
}

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => { return Promise.reject(error); }
);