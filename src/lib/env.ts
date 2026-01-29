// src/lib/env.ts

export const ENV = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || '',
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'OTSEM Bank',
};

export const validateEnv = () => {
  if (!ENV.API_URL) {
    console.warn(
      '[ENV WARNING]: NEXT_PUBLIC_API_URL is not defined. API requests will use relative paths (proxy mode).'
    );
  }
};
