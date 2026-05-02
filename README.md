# Contact Researcher — EU & UK

Multi-source contact discovery for EU and UK firms.

## Sources

| Source | Type | Key required |
|--------|------|-------------|
| Apollo.io | Companies + people search | Yes (pre-configured) |
| Hunter.io | Email discovery + verification | Yes (pre-configured) |
| OpenCorporates | Official EU/UK company registries | No — free |
| Google Places | Local business discovery | Yes — free tier ($200/mo credit) |
| Clearbit | Company enrichment | Optional (free autocomplete without key) |
| Legal 500 | Law firm directory, all EU + UK | No — scraped |
| Chambers & Partners | Law firm directory, all EU + UK | No — scraped |
| Bar Associations | ICPAC, Law Society UK, BRAK, CNB + 15 more | No — scraped |

## Deploy

1. Push this repo to GitHub (upload files directly — no git needed)
2. Connect to Cloudflare Pages (Workers & Pages → Create → Pages → Connect to Git)
3. Leave all build settings blank
4. Deploy

The `functions/` folder is automatically detected by Cloudflare Pages and runs server-side.

## Get a Google Places API key (free)

1. Go to https://console.cloud.google.com
2. Create a project → Enable "Places API"
3. Credentials → Create API Key
4. Paste into the tool (you get $200/month free — enough for ~2000 searches)

## Structure

```
index.html                    — frontend
functions/
  apollo/orgs.js              — Apollo org search proxy
  apollo/people.js            — Apollo people search proxy
  hunter/domain.js            — Hunter domain search proxy
  hunter/verify.js            — Hunter email verify proxy
  sources/opencorporates.js   — OpenCorporates registry search
  sources/places.js           — Google Places search
  sources/placedetails.js     — Google Place Details (website + phone)
  sources/clearbit.js         — Clearbit company enrichment
  sources/legal.js            — Legal 500, Chambers, Bar associations
```
