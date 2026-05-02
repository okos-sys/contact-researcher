// Legal directory scraper
// Scrapes public legal directories server-side (no CORS issues from Cloudflare edge)
// Sources: ICPAC (Cyprus), Law Society UK, Legal 500, Chambers, EU bar associations

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Map countries to their bar association / legal directory URLs and scrape strategy
const LEGAL_SOURCES = {
  'Cyprus': [
    {
      name: 'ICPAC',
      description: 'Cyprus Bar Association member search',
      url: 'https://www.cyprusbarassociation.org/index.php/en/members-list',
      searchUrl: (q) => `https://www.cyprusbarassociation.org/index.php/en/members-list?search=${encodeURIComponent(q)}`,
      note: 'Cyprus Bar Association — public member directory',
    },
    {
      name: 'Legal 500 Cyprus',
      url: 'https://www.legal500.com/c/cyprus/',
      note: 'Legal 500 Cyprus firm listings',
    },
    {
      name: 'Chambers Cyprus',
      url: 'https://chambers.com/legal-guide/cyprus',
      note: 'Chambers & Partners Cyprus',
    },
  ],
  'United Kingdom': [
    {
      name: 'Law Society UK',
      description: 'Solicitor search',
      searchUrl: (q, location) => `https://solicitors.lawsociety.org.uk/search/results?Pro=False&Name=${encodeURIComponent(q)}&Location=${encodeURIComponent(location)}&Radius=25&Type=0`,
      note: 'Law Society England & Wales — public solicitor register',
    },
    {
      name: 'Legal 500 UK',
      url: 'https://www.legal500.com/c/england-wales/',
      note: 'Legal 500 UK',
    },
    {
      name: 'Chambers UK',
      url: 'https://chambers.com/legal-guide/uk',
      note: 'Chambers & Partners UK',
    },
  ],
  'Germany': [
    { name: 'BRAK (German Bar)', url: 'https://www.brak.de/fuer-anwaelte/anwaltssuche/', note: 'Bundesrechtsanwaltskammer — German Bar' },
    { name: 'Legal 500 Germany', url: 'https://www.legal500.com/c/germany/', note: 'Legal 500 Germany' },
  ],
  'France': [
    { name: 'CNB (French Bar)', url: 'https://www.cnb.avocat.fr/fr/annuaire', note: 'Conseil National des Barreaux — French Bar' },
    { name: 'Legal 500 France', url: 'https://www.legal500.com/c/france/', note: 'Legal 500 France' },
  ],
  'Netherlands': [
    { name: 'NOvA (Dutch Bar)', url: 'https://www.advocatenorde.nl/zoek-een-advocaat', note: 'Nederlandse Orde van Advocaten' },
    { name: 'Legal 500 Netherlands', url: 'https://www.legal500.com/c/netherlands/', note: 'Legal 500 Netherlands' },
  ],
  'Spain': [
    { name: 'CGAE (Spanish Bar)', url: 'https://www.abogacia.es/buscador-de-abogados/', note: 'Consejo General de la Abogacía Española' },
    { name: 'Legal 500 Spain', url: 'https://www.legal500.com/c/spain/', note: 'Legal 500 Spain' },
  ],
  'Italy': [
    { name: 'CNF (Italian Bar)', url: 'https://www.consiglionazionaleforense.it/albo-avvocati', note: 'Consiglio Nazionale Forense' },
    { name: 'Legal 500 Italy', url: 'https://www.legal500.com/c/italy/', note: 'Legal 500 Italy' },
  ],
  'Greece': [
    { name: 'Athens Bar Association', url: 'https://www.dsa.gr/en/', note: 'Athens Bar Association' },
    { name: 'Legal 500 Greece', url: 'https://www.legal500.com/c/greece/', note: 'Legal 500 Greece' },
  ],
  'Poland': [
    { name: 'NRA (Polish Bar)', url: 'https://adwokatura.pl/szukaj-adwokata/', note: 'Naczelna Rada Adwokacka' },
    { name: 'Legal 500 Poland', url: 'https://www.legal500.com/c/poland/', note: 'Legal 500 Poland' },
  ],
  'Ireland': [
    { name: 'Law Society Ireland', url: 'https://www.lawsociety.ie/Find-a-Solicitor/', note: 'Law Society of Ireland' },
    { name: 'Legal 500 Ireland', url: 'https://www.legal500.com/c/ireland/', note: 'Legal 500 Ireland' },
  ],
  'Malta': [
    { name: 'Chamber of Advocates Malta', url: 'https://www.chamberofadvocates.com/', note: 'Chamber of Advocates Malta' },
    { name: 'Legal 500 Malta', url: 'https://www.legal500.com/c/malta/', note: 'Legal 500 Malta' },
  ],
  'Belgium': [
    { name: 'OBFG (Belgian Bar FR)', url: 'https://www.avocats.be/fr/trouver-un-avocat', note: 'Ordre des Barreaux Francophones et Germanophone' },
    { name: 'OVB (Flemish Bar)', url: 'https://www.advocaat.be/nl/zoek-een-advocaat', note: 'Orde van Vlaamse Balies' },
    { name: 'Legal 500 Belgium', url: 'https://www.legal500.com/c/belgium/', note: 'Legal 500 Belgium' },
  ],
  'Luxembourg': [
    { name: 'Barreau Luxembourg', url: 'https://www.barreau.lu/en/find-a-lawyer/', note: 'Barreau du Luxembourg' },
    { name: 'Legal 500 Luxembourg', url: 'https://www.legal500.com/c/luxembourg/', note: 'Legal 500 Luxembourg' },
  ],
  'Austria': [
    { name: 'ÖRAK (Austrian Bar)', url: 'https://www.rechtsanwaelte.at/buergerservice/anwaltssuche/', note: 'Österreichischer Rechtsanwaltskammertag' },
    { name: 'Legal 500 Austria', url: 'https://www.legal500.com/c/austria/', note: 'Legal 500 Austria' },
  ],
  'Sweden': [
    { name: 'Advokatsamfundet', url: 'https://www.advokatsamfundet.se/Hitta-advokat/', note: 'Swedish Bar Association' },
    { name: 'Legal 500 Sweden', url: 'https://www.legal500.com/c/sweden/', note: 'Legal 500 Sweden' },
  ],
  'Denmark': [
    { name: 'Advokatsamfundet DK', url: 'https://www.advokatsamfundet.dk/find-advokat/', note: 'Danish Bar Association' },
    { name: 'Legal 500 Denmark', url: 'https://www.legal500.com/c/denmark/', note: 'Legal 500 Denmark' },
  ],
  'Finland': [
    { name: 'Finnish Bar Association', url: 'https://www.asianajajaliitto.fi/en/find-a-lawyer/', note: 'Suomen Asianajajaliitto' },
    { name: 'Legal 500 Finland', url: 'https://www.legal500.com/c/finland/', note: 'Legal 500 Finland' },
  ],
  'Estonia': [
    { name: 'Estonian Bar Association', url: 'https://www.advokatuur.ee/eng/leia-advokaat', note: 'Eesti Advokatuur' },
    { name: 'Legal 500 Estonia', url: 'https://www.legal500.com/c/estonia/', note: 'Legal 500 Estonia' },
  ],
  'Latvia': [
    { name: 'Latvian Bar Association', url: 'https://www.latvijasadvokatura.lv/lv/find-a-lawyer/', note: 'Latvijas Zvērinātu advokātu padome' },
    { name: 'Legal 500 Baltic', url: 'https://www.legal500.com/c/latvia/', note: 'Legal 500 Latvia' },
  ],
  'Lithuania': [
    { name: 'Lithuanian Bar Association', url: 'https://www.advokatura.lt/en/find-a-lawyer/', note: 'Lietuvos advokatūra' },
    { name: 'Legal 500 Lithuania', url: 'https://www.legal500.com/c/lithuania/', note: 'Legal 500 Lithuania' },
  ],
};

// Scrape Legal 500 firm listing for a country
async function scrapeLegal500(country) {
  const sources = LEGAL_SOURCES[country] || [];
  const l500 = sources.find(s => s.name.startsWith('Legal 500'));
  if (!l500) return [];

  try {
    const resp = await fetch(l500.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ContactResearcher/1.0)',
        'Accept': 'text/html',
      }
    });
    if (!resp.ok) return [];
    const html = await resp.text();

    // Extract firm names and links from Legal 500 HTML
    const firms = [];
    const firmPattern = /href="(\/firms\/[^"]+)"[^>]*>([^<]+)<\/a>/g;
    let match;
    while ((match = firmPattern.exec(html)) !== null) {
      const name = match[2].trim();
      if (name && name.length > 2 && !name.includes('Legal 500')) {
        firms.push({
          name,
          url: 'https://www.legal500.com' + match[1],
          source: 'Legal 500',
          country,
        });
      }
    }

    // Also try structured data
    const structuredPattern = /"name"\s*:\s*"([^"]{3,80})"/g;
    while ((match = structuredPattern.exec(html)) !== null) {
      const name = match[1].trim();
      if (name && !firms.find(f => f.name === name)) {
        firms.push({ name, source: 'Legal 500', country });
      }
    }

    return firms.slice(0, 30);
  } catch (e) {
    return [];
  }
}

// Scrape Chambers firm listing
async function scrapeChambers(country) {
  const sources = LEGAL_SOURCES[country] || [];
  const chambers = sources.find(s => s.name.startsWith('Chambers'));
  if (!chambers) return [];

  try {
    const resp = await fetch(chambers.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ContactResearcher/1.0)', 'Accept': 'text/html' }
    });
    if (!resp.ok) return [];
    const html = await resp.text();
    const firms = [];
    // Extract firm names from Chambers HTML
    const firmPattern = /class="[^"]*firm[^"]*"[^>]*>[\s\S]{0,200}?<[^>]*>([A-Z][^<]{2,60})<\//g;
    let match;
    while ((match = firmPattern.exec(html)) !== null) {
      const name = match[1].trim();
      if (name && name.length > 3) {
        firms.push({ name, source: 'Chambers & Partners', country });
      }
    }
    return firms.slice(0, 20);
  } catch (e) {
    return [];
  }
}

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const country = url.searchParams.get('country') || '';
  const source = url.searchParams.get('source') || 'all';

  // Return directory URLs for this country (always available, no scraping needed)
  const sources = LEGAL_SOURCES[country] || [];
  if (!sources.length) {
    return new Response(JSON.stringify({
      directories: [],
      firms: [],
      message: `No legal directories configured for ${country}`,
    }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
  }

  let firms = [];

  if (source === 'legal500' || source === 'all') {
    const l500firms = await scrapeLegal500(country);
    firms = firms.concat(l500firms);
  }

  if (source === 'chambers' || source === 'all') {
    const chambersFirms = await scrapeChambers(country);
    firms = firms.concat(chambersFirms);
  }

  // Deduplicate by name
  const seen = new Set();
  firms = firms.filter(f => {
    if (seen.has(f.name)) return false;
    seen.add(f.name);
    return true;
  });

  return new Response(JSON.stringify({
    directories: sources.map(s => ({ name: s.name, url: s.url || s.searchUrl?.('') || '', note: s.note })),
    firms,
    country,
  }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: cors });
}
