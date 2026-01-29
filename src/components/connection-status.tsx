// src/components/connection-status.tsx
'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useHealthCheck } from '@/hooks/use-health-check';

export function ConnectionStatus() {
  const { isHealthy, lastCheck } = useHealthCheck(15000); // Check every 15s
  const toastIdRef = useRef<string | number | null>(null);

  useEffect(() => {
    if (isHealthy === false) {
      // If unhealthy and no toast shown yet
      if (!toastIdRef.current) {
        toastIdRef.current = toast.error('Backend connection lost', {
          description: 'The application is unable to reach the API server. Some features may not work.',
          duration: Infinity,
        });
      }
    } else if (isHealthy === true) {
      // If healthy and a toast was being shown, dismiss it
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
        toast.success('Connection restored');
      }
    }
  }, [isHealthy]);

  return null; // This component only manages toasts
}
