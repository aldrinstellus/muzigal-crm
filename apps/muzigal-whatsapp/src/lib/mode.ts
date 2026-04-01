const MODE_KEY = 'zoo_wa_mode';

export type AppMode = 'demo' | 'prod';

export function getMode(): AppMode {
  return (localStorage.getItem(MODE_KEY) as AppMode) || 'prod';
}

export function setMode(mode: AppMode) {
  localStorage.setItem(MODE_KEY, mode);
}

export function isDemo(): boolean {
  return getMode() === 'demo';
}
