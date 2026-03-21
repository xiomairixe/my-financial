import { useEffect } from 'react';

const PING_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes

export default function useKeepAlive() {
  useEffect(() => {
    const base = (import.meta.env.VITE_API_URL || '/api').replace('/api', '');

    const ping = async () => {
      try {
        await fetch(`${base}/`, { signal: AbortSignal.timeout(8000) });
        console.log('[KeepAlive] ✅ Server pinged:', new Date().toLocaleTimeString());
      } catch {
        console.warn('[KeepAlive] ⚠️ Ping failed — server may be sleeping.');
      }
    };

    // Ping agad pagkatapos mag-mount, tapos every 14 minutes
    ping();
    const interval = setInterval(ping, PING_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);
}