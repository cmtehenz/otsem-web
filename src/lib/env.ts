// src/lib/env.ts

export const ENV = {
  // Prefer environment variable, but fallback to the project's default API URL
  API_URL: (process.env.NEXT_PUBLIC_API_URL || 'https://api.otsembank.com').replace(/\/+$/, ''),
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'OTSEM Bank',
};

export const validateEnv = () => {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    console.warn(
      '[ENV WARNING]: NEXT_PUBLIC_API_URL is not defined in process.env. Using fallback: ' + ENV.API_URL
    );
  }
};
