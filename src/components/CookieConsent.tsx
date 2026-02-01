'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const COOKIE_CONSENT_KEY = 'cookie-consent';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Don't show in PWA standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone);
    if (isStandalone) return;

    // Check if user has already made a choice
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setShowBanner(true);
      // Delay for animation
      setTimeout(() => setIsVisible(true), 100);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
  };

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t shadow-lg">
        <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 text-sm">
              <p className="font-medium mb-1">Utilizamos cookies</p>
              <p className="text-muted-foreground">
                Utilizamos cookies para melhorar sua experiência de navegação, fornecer conteúdo
                personalizado e analisar nosso tráfego. Ao clicar em &ldquo;Aceitar&rdquo;, você concorda com
                o uso de cookies.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                onClick={handleReject}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
              >
                Rejeitar
              </Button>
              <Button
                onClick={handleAccept}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                Aceitar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
