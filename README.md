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
  (Briess, Weyermann, Simpsons, Crisp, Dingemans…), 70+ hop varieties grouped
  by origin, and 65+ yeast strains from six labs (Fermentis, Lallemand,
  White Labs, Wyeast, Omega, Imperial), searchable and used directly by the
  designer. Users can add custom fermentables, hops, and yeasts from the UI;
  custom entries persist on-device and recipes keep a full copy of every
  ingredient's data, so deleting a custom entry never breaks a saved recipe.
- **Brewing tools** — ABV, strike water, priming sugar, hydrometer temperature
  correction, and dilution/boil-off calculators.
- **Water chemistry** — every recipe has a Water section: pick a source
  (8 classic city presets or your own saved water), pick a style target
  (hoppy pale, juicy IPA, balanced, malty, stout, crisp lager), and either
  dose the six common brewing salts by hand or let the built-in solver
  suggest additions that approach the target. Live readouts show the treated
  ion profile, sulfate:chloride balance, residual alkalinity, an estimated
  mash pH, and a lactic acid suggestion. The Water page imports **Ward Labs
  reports** — paste the report text and the parser extracts the six brewing
  ions (converting Ward's sulfur-basis SO₄-S to SO₄ automatically) and saves
  it as a reusable source profile.
- **BeerXML export** — recipes export to BeerXML 1.0 (imports into BeerSmith,
  Brewfather, etc.) and plain JSON.
- **Equipment profiles** — model your rig (boil-off, kettle/lauter deadspace,
  grain absorption, fermenter loss) with presets for kettle+cooler, BIAB,
  all-in-one electric, and three-vessel systems; volumes (pre-boil, strike,
  sparge, packaged) derive from it automatically.
- **Multi-step mash schedules** — infusion, temperature, and decoction steps
  with per-step water guidance (strike temp, Palmer infusion volumes,
  decoction pull estimates) and batch/fly/full-volume sparge handling.
- **Misc additions** — spices, finings, water agents, fruit, and flavorings
  as first-class recipe items with an 18-entry quick-add catalog.
- **Yeast pitch & starters** — pitch-rate targets by beer type, pack
  viability decay, and stir-plate starter sizing.
- **Packaging depth** — priming sugar in four sugar types plus keg
  force-carbonation PSI, right in the recipe.
- **Refractometer support** — Brix conversions with wort correction and
  alcohol-corrected FG (Terrill).
- **BeerXML import & export** — bring recipes in from BeerSmith/Brewfather
  and send them back out.
- **Brew day mode** — every recipe generates a step-by-step checklist
  (water treatment, mash steps, timed boil additions, whirlpool, pitch,
  dry hops, packaging) with built-in countdown timers.
- **Batch logging** — brew sessions snapshot predictions and track measured
  pre-boil/OG/FG/volume, a gravity log, notes, and status; the app computes
  actual efficiency, ABV, and attenuation and compares them to predictions.
- **Inventory** — track grain/hops/yeast/misc stock with optional cost,
  generate a per-recipe shopping list, and deduct a batch's ingredients on
  brew day.
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
| `GET/POST /api/sessions`, `PUT/DELETE /api/sessions/{id}` | Brew session CRUD |
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
- Water: standard salt ion contributions (ppm per g/gal); salt suggestions via
  non-negative least squares; residual alkalinity per Kolbach/Palmer
  (`alkalinity − Ca/1.4 − Mg/1.7`); mash pH is a simplified estimate from
  grist distilled-water pH, RA scaled by mash thickness, and 88% lactic at
  ~11.8 mEq/mL against ~40 mEq/kg·pH grist buffering — guidance, not a meter.
