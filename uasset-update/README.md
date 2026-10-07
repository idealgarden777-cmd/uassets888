# UAsset

Icon library for `uasset.signaturesi.com`: static HTML/CSS/JS front end plus one Vercel serverless router (`api/[...route].js`) backed by Supabase, Bean ID auth and Lemon Squeezy billing.

## Public API
| Route | Purpose |
| --- | --- |
| `GET /api/icons` | Active icons (Free SVG URLs are public, Pro stay private) |
| `GET /api/categories` | Active categories in admin sort order |
| `GET /api/collections` | Active collections (category groups) |
| `GET /api/assets/pro?id=` | Signed URL for a Pro icon (Bean session + active Pro) |
| `POST /api/billing/create-checkout` | Lemon Squeezy checkout |
| `GET /api/billing/status` | Current plan |
| `POST /api/billing/webhook` | Lemon Squeezy webhook (raw body) |

Admin routes live under `/api/admin/{icons,collections,categories}/{list,create,update,delete}` and are used by `/admin`.

## How the library loads
1. `js/icons.js` renders instantly as the bundled fallback.
2. `/api/icons` adds new icons and applies admin edits (name, category, tags, description, plan) to bundled ones.
3. `/api/categories` sets the filter order; `/api/collections` replaces the bundled collection cards once the admin has created any. Counts are computed live.

## Environment (Vercel)
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `LEMONSQUEEZY_*`, admin Bean user IDs. Never expose service-role keys in the browser.
