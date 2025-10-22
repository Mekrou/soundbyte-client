// src/global.d.ts
export {};

declare global {
  interface Window {
    electronAPI: {
      onFocusInput: (callback: () => void) => void;
    };
  }
}
