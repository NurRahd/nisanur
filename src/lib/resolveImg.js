/**
 * Shared helper — resolve image src to a displayable URL.
 * - UUID filename → Supabase Storage public URL
 * - Full URL / starts with / → as-is
 * - Legacy asset name → dynamic import from src/assets
 * - fallback → provided fallback image
 */
export function resolveImg(src, fallback = null) {
  if (!src) return fallback;
  if (src.startsWith('http') || src.startsWith('/')) return src;

  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}/i;
  if (uuidPattern.test(src)) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl) {
      return `${supabaseUrl}/storage/v1/object/public/portfolio/${src}`;
    }
    // dev fallback via vite proxy
    return `/uploads/${src}`;
  }

  // Legacy seeded asset — load from src/assets
  try {
    return new URL(`../assets/${src}`, import.meta.url).href;
  } catch {
    return fallback;
  }
}
