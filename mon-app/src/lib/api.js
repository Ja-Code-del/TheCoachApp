const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function fetchUnsplashImage(theme) {
  const res = await fetch(`${BASE_URL}/api/image?theme=${encodeURIComponent(theme)}`);
  if (!res.ok) throw new Error(`Image API error: ${res.status}`);
  return await res.json();
}

export async function fetchAIQuote(theme, daysLeft) {
  const res = await fetch(`${BASE_URL}/api/quote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ theme, daysLeft }),
  });
  if (!res.ok) throw new Error(`Quote API error: ${res.status}`);
  return await res.json();
}