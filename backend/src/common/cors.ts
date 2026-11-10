const DEFAULT_ORIGIN = 'http://localhost:3000';

/**
 * Origins allowed to call the API / connect over WebSocket.
 * FRONTEND_URL may hold a comma-separated list, e.g.
 *   FRONTEND_URL=http://localhost:3000,https://alumate.vercel.app
 * Read lazily so it works regardless of when .env is loaded.
 */
export function getAllowedOrigins(): string[] {
  const raw = process.env.FRONTEND_URL || DEFAULT_ORIGIN;
  return raw
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}

type OriginCallback = (err: Error | null, allow?: boolean) => void;

/** CORS origin callback shared by Express (REST) and Socket.io. */
export function corsOrigin(origin: string | undefined, callback: OriginCallback) {
  // Requests without an Origin header (curl, server-to-server, health checks)
  if (!origin) return callback(null, true);
  callback(null, getAllowedOrigins().includes(origin.replace(/\/+$/, '')));
}
