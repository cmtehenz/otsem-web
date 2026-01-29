// src/hooks/use-health-check.ts
import { useState, useEffect, useCallback } from 'react';
import { ENV } from '@/lib/env';

export function useHealthCheck(intervalMs = 30000) {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      const response = await fetch(`${ENV.API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // If we get any response (even 401), the backend is up
      setIsHealthy(true);
      setLastCheck(new Date());
    } catch (error) {
      console.error('[Health Check Failed]:', error);
      setIsHealthy(false);
      setLastCheck(new Date());
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, intervalMs);
    return () => clearInterval(interval);
  }, [checkHealth, intervalMs]);

  return { isHealthy, lastCheck, refetch: checkHealth };
}
