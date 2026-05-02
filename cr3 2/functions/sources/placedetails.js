// Google Place Details API — fetches website + phone for a Place ID

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Google-Key',
};

export async function onRequestGet({ request }) {
  const googleKey = request.headers.get('X-Google-Key') || '';
  if (!googleKey) return new Response(JSON.stringify({ error: 'Missing Google key' }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });

  const url = new URL(request.url);
  const placeId = url.searchParams.get('place_id') || '';
  if (!placeId) return new Response(JSON.stringify({ error: 'place_id required' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });

  const fields = 'name,website,formatted_phone_number,formatted_address,international_phone_number';
  const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${fields}&key=${googleKey}`;

  try {
    const resp = await fetch(apiUrl);
    const data = await resp.json();
    const r = data.result || {};
    return new Response(JSON.stringify({
      name: r.name || '',
      website: r.website || '',
      phone: r.formatted_phone_number || r.international_phone_number || '',
      address: r.formatted_address || '',
    }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: cors });
}
