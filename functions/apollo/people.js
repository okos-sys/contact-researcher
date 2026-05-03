export async function onRequestPost({ request }) {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-Apollo-Key' };
  const apolloKey = request.headers.get('X-Apollo-Key') || '';
  if (!apolloKey) return new Response(JSON.stringify({ error: 'Missing Apollo key' }), { status: 401, headers: cors });
  let body;
  try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: cors }); }
  // Do NOT put api_key in body — Apollo now requires it in X-Api-Key header
  delete body.api_key;
  const resp = await fetch('https://api.apollo.io/v1/mixed_people/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Api-Key': apolloKey,
    },
    body: JSON.stringify(body),
  });
  const data = await resp.json();
  return new Response(JSON.stringify(data), { status: resp.status, headers: { ...cors, 'Content-Type': 'application/json' } });
}
export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-Apollo-Key' } });
}
