// src/lib/env.ts

export const ENV = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333',
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'OTSEM Bank',
};

export const validateEnv = () => {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    console.warn(
      '[ENV WARNING]: NEXT_PUBLIC_API_URL is not defined. Falling back to http://localhost:3333'
    );
  }
};
