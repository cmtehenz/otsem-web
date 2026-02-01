// Server-side in-memory cache for the active bank provider.
// Populated when an admin visits the bank settings page.
// Falls back to "inter" if never explicitly set.

let _activeBank = "inter";
let _initialized = false;

export function getActiveBank(): string {
  return _activeBank;
}

export function setActiveBank(provider: string): void {
  _activeBank = provider.toLowerCase();
  _initialized = true;
}

export function isBankCacheInitialized(): boolean {
  return _initialized;
}
