// Google Places Text Search API
// Key passed per-request via X-Google-Key header

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Google-Key',
};

export async function onRequestGet({ request }) {
  const googleKey = request.headers.get('X-Google-Key') || '';
  if (!googleKey) {
    return new Response(JSON.stringify({ error: 'Missing Google key', places: [] }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
  }

  const url = new URL(request.url);
  const query = url.searchParams.get('query') || '';
  const pagetoken = url.searchParams.get('pagetoken') || '';

  if (!query) return new Response(JSON.stringify({ error: 'query param required', places: [] }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });

  let apiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${googleKey}&type=establishment`;
  if (pagetoken) apiUrl += `&pagetoken=${encodeURIComponent(pagetoken)}`;

  try {
    const resp = await fetch(apiUrl);
    const data = await resp.json();

    const places = (data.results || []).map(p => ({
      name: p.name,
      address: p.formatted_address || '',
      placeId: p.place_id || '',
      rating: p.rating || null,
      website: '',  // requires Place Details call
      phone: '',    // requires Place Details call
      source: 'Google Places',
    }));

    return new Response(JSON.stringify({ places, nextPageToken: data.next_page_token || null, status: data.status }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, places: [] }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: cors });
}
