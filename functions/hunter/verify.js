export async function onRequestGet({ request }) {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-Hunter-Key' };
  const hunterKey = request.headers.get('X-Hunter-Key') || '';
  if (!hunterKey) return new Response(JSON.stringify({ error: 'Missing Hunter key' }), { status: 401, headers: cors });
  const url = new URL(request.url);
  const email = url.searchParams.get('email');
  if (!email) return new Response(JSON.stringify({ error: 'email param required' }), { status: 400, headers: cors });
  const target = `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${hunterKey}`;
  const resp = await fetch(target, { headers: { 'Cache-Control': 'no-cache' } });
  const data = await resp.json();
  return new Response(JSON.stringify(data), { status: resp.status, headers: { ...cors, 'Content-Type': 'application/json' } });
}
export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-Hunter-Key' } });
}
