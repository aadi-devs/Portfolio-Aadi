/** Storage accepted by Supabase's `auth.storage` option. */
export interface PreviewAuthStorage {
  getItem: (key: string) => string | null | Promise<string | null>;
  setItem: (key: string, value: string) => void | Promise<void>;
  removeItem: (key: string) => void | Promise<void>;
}

/**
 * Returns the browser's localStorage as auth storage.
 */
export function brokeredPreviewStorage(): PreviewAuthStorage | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage;
}
