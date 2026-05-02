export async function onRequestGet({ request }) {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-Hunter-Key' };
  const hunterKey = request.headers.get('X-Hunter-Key') || '';
  if (!hunterKey) return new Response(JSON.stringify({ error: 'Missing Hunter key' }), { status: 401, headers: cors });
  const url = new URL(request.url);
  const domain = url.searchParams.get('domain');
  const limit = url.searchParams.get('limit') || '5';
  if (!domain) return new Response(JSON.stringify({ error: 'domain param required' }), { status: 400, headers: cors });
  const target = `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&api_key=${hunterKey}&limit=${limit}&type=personal`;
  const resp = await fetch(target, { headers: { 'Cache-Control': 'no-cache' } });
  const data = await resp.json();
  return new Response(JSON.stringify(data), { status: resp.status, headers: { ...cors, 'Content-Type': 'application/json' } });
}
export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-Hunter-Key' } });
}
