// OpenCorporates API — free, no key required
// Docs: https://api.opencorporates.com/documentation/API-Reference

const JURISDICTION_MAP = {
  'Cyprus': 'cy',
  'Malta': 'mt',
  'Greece': 'gr',
  'Italy': 'it',
  'Spain': 'es',
  'Portugal': 'pt',
  'Germany': 'de',
  'France': 'fr',
  'Netherlands': 'nl',
  'Belgium': 'be',
  'Austria': 'at',
  'Ireland': 'ie',
  'Luxembourg': 'lu',
  'Sweden': 'se',
  'Denmark': 'dk',
  'Finland': 'fi',
  'Norway': 'no',
  'Poland': 'pl',
  'Czech Republic': 'cz',
  'Hungary': 'hu',
  'Romania': 'ro',
  'Bulgaria': 'bg',
  'Estonia': 'ee',
  'Latvia': 'lv',
  'Lithuania': 'lt',
  'United Kingdom': 'gb',
};

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const country = url.searchParams.get('country') || '';
  const q = url.searchParams.get('q') || '';
  const page = url.searchParams.get('page') || '1';
  const perPage = url.searchParams.get('per_page') || '20';

  const jurisdiction = JURISDICTION_MAP[country] || '';
  if (!jurisdiction) {
    return new Response(JSON.stringify({ error: `No jurisdiction mapping for: ${country}`, companies: [] }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
  }

  // Search OpenCorporates for active companies in jurisdiction
  let apiUrl = `https://api.opencorporates.com/v0.4/companies/search?jurisdiction_code=${jurisdiction}&current_status=Active&page=${page}&per_page=${perPage}&format=json`;
  if (q) apiUrl += `&q=${encodeURIComponent(q)}`;

  try {
    const resp = await fetch(apiUrl, {
      headers: { 'User-Agent': 'ContactResearcher/1.0', 'Accept': 'application/json' }
    });
    if (!resp.ok) {
      return new Response(JSON.stringify({ error: `OpenCorporates returned ${resp.status}`, companies: [] }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
    }
    const data = await resp.json();
    const companies = (data.results?.companies || []).map(c => c.company).map(c => ({
      name: c.name,
      companyNumber: c.company_number,
      jurisdiction: c.jurisdiction_code,
      registeredAddress: c.registered_address_in_full || '',
      incorporationDate: c.incorporation_date || '',
      companyType: c.company_type || '',
      status: c.current_status || '',
      opencorporatesUrl: c.opencorporates_url || '',
      source: 'OpenCorporates',
    }));
    return new Response(JSON.stringify({ companies, totalCount: data.results?.total_count || 0 }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, companies: [] }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: cors });
}
