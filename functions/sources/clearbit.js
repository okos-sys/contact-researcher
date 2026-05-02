// Clearbit Enrichment API — enriches company data by domain
// Free tier: 50 lookups/month on autocomplete, paid for enrichment
// Using the free Company Name Autocomplete endpoint + Enrichment

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Clearbit-Key',
};

export async function onRequestGet({ request }) {
  const clearbitKey = request.headers.get('X-Clearbit-Key') || '';
  const url = new URL(request.url);
  const domain = url.searchParams.get('domain') || '';
  const name = url.searchParams.get('name') || '';

  if (!domain && !name) {
    return new Response(JSON.stringify({ error: 'domain or name required' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
  }

  try {
    // If no key, use the free autocomplete endpoint
    if (!clearbitKey && name) {
      const autoUrl = `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(name)}`;
      const resp = await fetch(autoUrl);
      const data = await resp.json();
      return new Response(JSON.stringify({ results: data, source: 'Clearbit Autocomplete (free)' }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    // With key: full company enrichment
    if (clearbitKey && domain) {
      const enrichUrl = `https://company.clearbit.com/v2/companies/find?domain=${encodeURIComponent(domain)}`;
      const resp = await fetch(enrichUrl, {
        headers: { 'Authorization': `Bearer ${clearbitKey}` }
      });
      if (resp.status === 404) {
        return new Response(JSON.stringify({ found: false }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
      }
      const data = await resp.json();
      return new Response(JSON.stringify({
        found: true,
        name: data.name || '',
        domain: data.domain || '',
        description: data.description || '',
        employeeCount: data.metrics?.employees || null,
        foundedYear: data.foundedYear || null,
        location: data.location || '',
        linkedin: data.linkedin?.handle ? `https://linkedin.com/company/${data.linkedin.handle}` : '',
        twitter: data.twitter?.handle || '',
        phone: data.phone || '',
        source: 'Clearbit',
      }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Provide Clearbit key for enrichment, or name for free autocomplete' }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: cors });
}
