# 🍺 BrewHaus

A modern take on BeerSmith: a homebrew recipe designer with a clean, dark,
fast web interface and a serverless Azure backend that costs (almost) nothing
to run.

![CI](../../actions/workflows/deploy.yml/badge.svg)

## What it does

- **Recipe designer** — build a grain bill, hop schedule, yeast pick, and mash
  profile and watch the vitals update live: OG, FG, ABV, IBU (Tinseth),
  SRM color (Morey), calories, and BU:GU balance.
- **Style guidance** — every stat is shown on a range meter against BJCP 2021
  guidelines for 25 styles, with clear in-style / low / high flags.
- **Ingredient catalog** — 110+ fermentables organized by group and maltster
  (Briess, Weyermann, Simpsons, Crisp, Dingemans…), 22 hop varieties, and 16
  yeast strains, searchable and used directly by the designer. Users can add
  their own custom fermentables from the UI; custom entries persist on-device
  and recipes keep a full copy of every ingredient's data, so deleting a
  custom entry never breaks a saved recipe.
- **Brewing tools** — ABV, strike water, priming sugar, hydrometer temperature
  correction, and dilution/boil-off calculators.
- **BeerXML export** — recipes export to BeerXML 1.0 (imports into BeerSmith,
  Brewfather, etc.) and plain JSON.
- **Works offline** — the app runs fully from localStorage when the API isn't
  reachable, and syncs to Cosmos DB when it is.

## Architecture

Everything is serverless and sits inside Azure's free tiers.

```
┌────────────────────────────────────────────────────────┐
│  Azure Static Web Apps (Free tier)                     │
│                                                        │
│  ┌──────────────────┐      ┌─────────────────────────┐ │
│  │  React SPA       │ /api │  Managed Azure Functions│ │
│  │  (Vite build)    ├─────▶│  Node 20, HTTP triggers │ │
│  └──────────────────┘      └───────────┬─────────────┘ │
└────────────────────────────────────────┼───────────────┘
                                         ▼
                           ┌──────────────────────────┐
                           │  Azure Cosmos DB          │
                           │  free tier (1000 RU/s) or │
                           │  serverless (pay-per-use) │
                           └──────────────────────────┘
```

| Component | Service | Monthly cost |
|---|---|---|
| Frontend hosting + SSL + CDN | Static Web Apps **Free** | $0 |
| API (`/api/*`) | SWA **managed functions** (consumption) | $0 (included) |
| Database | Cosmos DB **free tier** (1000 RU/s, 25 GB) | $0 |
| Database (alternative) | Cosmos DB **serverless** | pennies at hobby scale |

The brewing math lives in a shared package (`@brewhaus/core`) used by both the
SPA and the API, so calculations are identical client- and server-side and are
covered by a unit-test suite.

```
packages/core   TypeScript brewing engine: gravity, Tinseth IBU, Morey SRM,
                strike water, priming, BeerXML export, BJCP styles, catalog
api             Azure Functions v4 (Node): recipe CRUD + stats + BeerXML,
                Cosmos DB store with an in-memory fallback for local dev
web             React + Vite SPA: designer, calculators, ingredient browser
infra           Bicep template for the whole environment
```

## Local development

```bash
npm install
npm test           # calculation engine unit tests
npm run build      # builds core, api, and web

npm run dev        # Vite dev server at http://localhost:5173
```

The SPA detects whether the API is reachable. With no backend running it uses
localStorage (fully functional, seeded with two example recipes). To run the
API locally, install [Azure Functions Core Tools](https://learn.microsoft.com/azure/azure-functions/functions-run-local)
and:

```bash
cd api
cp local.settings.json.example local.settings.json
npm run build && func start     # http://localhost:7071/api/health
```

`vite dev` proxies `/api` to port 7071 automatically. Leave
`COSMOS_CONNECTION_STRING` unset to use the in-memory dev store.

## Deploying to Azure

1. **Provision** (one time):

   ```bash
   az group create -n brewhaus-rg -l eastus2
   az deployment group create -g brewhaus-rg -f infra/main.bicep
   ```

   If your subscription's one Cosmos free-tier account is already used:
   `-p cosmosMode=serverless`.

2. **Wire up CI/CD**: grab the deployment token and add it as a GitHub Actions
   secret named `AZURE_STATIC_WEB_APPS_API_TOKEN`:

   ```bash
   az staticwebapp secrets list -n brewhaus-web --query properties.apiKey -o tsv
   ```

3. **Push to `main`**. The workflow tests, builds all three workspaces, and
   deploys the prebuilt SPA + API bundle to Static Web Apps.

## API

| Method & path | Purpose |
|---|---|
| `GET /api/health` | Liveness + which store is active |
| `GET /api/recipes` | List recipes (newest first) |
| `POST /api/recipes` | Create a recipe |
| `GET /api/recipes/{id}` | Fetch one recipe |
| `PUT /api/recipes/{id}` | Update (upsert) a recipe |
| `DELETE /api/recipes/{id}` | Delete a recipe |
| `GET /api/recipes/{id}/stats` | Server-side calculated vitals |
| `GET /api/recipes/{id}/beerxml` | Download as BeerXML |

## Brewing math references

- IBU: Tinseth utilization (bigness × boil-time factor), +10% for pellets,
  whirlpool at 50% of a 20-minute-equivalent boil addition.
- Color: Morey — `SRM = 1.4922 × MCU^0.6859`.
- ABV: `(OG − FG) × 131.25`; calories from real extract via Plato conversions.
- Strike water: `(0.2 / ratio) × (T_mash − T_grain) + T_mash`.
- Priming: residual CO₂ by temperature, corn sugar at 15.195 g per volume-gallon.
