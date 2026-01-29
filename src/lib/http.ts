// src/lib/http.ts
import axios, { type AxiosInstance, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, clearTokens } from './token';
import { ENV } from './env';

const BASE_URL = ENV.API_URL;

interface CustomAxiosConfig extends AxiosRequestConfig {
    anonymous?: boolean;
}

const httpClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar o token em todas as requisições
httpClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Se a requisição tiver header X-Anonymous, não adiciona o token
        if (config.headers?.['X-Anonymous']) {
            delete config.headers['X-Anonymous'];
            return config;
        }

        const token = getAccessToken();

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para tratar erros de autenticação e rede
httpClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Se receber 401, limpa os tokens e redireciona para login
        if (error.response?.status === 401) {
            clearTokens();

            // Apenas redireciona se não estiver em rotas públicas
            if (typeof window !== 'undefined' &&
                !window.location.pathname.includes('/login') &&
                !window.location.pathname.includes('/register')) {
                window.location.href = '/login';
            }
        }

        // Trata erro de rede (quando a API está offline ou o URL está errado)
        if (!error.response && error.request) {
            console.error('Erro de rede: Sem resposta do servidor', error.config?.url);
            error.message = 'Não foi possível conectar ao servidor. Verifique sua conexão ou tente novamente mais tarde.';
        }

        return Promise.reject(error);
    }
);

export default httpClient;

// Método helper para requisições autenticadas
function withAnonymous(config?: CustomAxiosConfig): AxiosRequestConfig {
    if (!config) return {};
    const { anonymous, ...rest } = config;
    return rest;
}

export const get = <T = unknown>(url: string, config?: CustomAxiosConfig) =>
    httpClient.get<T>(url, withAnonymous(config));

export const post = <T = unknown>(url: string, data?: unknown, config?: CustomAxiosConfig) =>
    httpClient.post<T>(url, data, withAnonymous(config));

export const put = <T = unknown>(url: string, data?: unknown, config?: CustomAxiosConfig) =>
    httpClient.put<T>(url, data, withAnonymous(config));

export const del = <T = unknown>(url: string, config?: CustomAxiosConfig) =>
    httpClient.delete<T>(url, withAnonymous(config));
