// src/lib/api/axios.ts
import axios from 'axios';
export const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

api.interceptors.request.use((cfg) => {
    const t = localStorage.getItem('access_token');
    if (t) cfg.headers.Authorization = `Bearer ${t}`;
    return cfg;
});

let refreshing: Promise<string> | null = null;
api.interceptors.response.use(
    r => r,
    async (err) => {
        if (err.response?.status === 401) {
            if (!refreshing) {
                refreshing = (async () => {
                    const rt = localStorage.getItem('refresh_token');
                    const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, { refreshToken: rt });
                    localStorage.setItem('access_token', data.accessToken);
                    return data.accessToken;
                })();
            }
            const newToken = await refreshing.finally(() => (refreshing = null));
            err.config.headers.Authorization = `Bearer ${newToken}`;
            return api.request(err.config);
        }
        throw err;
    }
);
