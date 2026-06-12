# Virtual Try-On API Example (Next.js + @genlook/api)

A minimal e-commerce mock that shows how to integrate the [Genlook virtual try-on API](https://genlook.app/docs/tryon-api/introduction) using the official [`@genlook/api`](https://www.npmjs.com/package/@genlook/api) TypeScript SDK.

This demo follows the **recommended two-step flow** from the [quickstart](https://genlook.app/docs/tryon-api/quickstart):

1. **Upload** the customer photo once → get an `imageId`
2. **Try-on** any product referencing that `imageId`
3. **Poll** generation status until complete

The same `imageId` is reused across all 5 products — no re-upload when browsing the catalog.

## What's included

- A 5-product JSON catalog (`data/products.json`)
- Product images in `public/products/`
- Step 1: customer photo upload (`POST /api/images/upload`)
- Step 2: try-on with `customer.id` (`POST /api/try-on`)
- Step 3: generation polling (`GET /api/generations/:id`)
- Server-side API routes so your API key never reaches the browser

## Why a server proxy?

The Genlook SDK is designed for server runtimes (Node 20+, Deno, Bun, Edge). API keys must stay on your backend. The browser calls Next.js API routes; those routes call `@genlook/api` server-side.

## Quick start

### 1. Get an API key

Create a Genlook Try-On API account and copy your key:

[https://genlook.app/try-on/api](https://genlook.app/try-on/api)

### 2. Install and configure

```bash
cd virtual-try-on-api-example
pnpm install --ignore-workspace
cp .env.example .env.local
```

When this folder lives inside the Genlook monorepo, use `pnpm install --ignore-workspace` so it gets its own isolated `node_modules` and pulls `@genlook/api` from npm. When you move it to a standalone repo, a normal `pnpm install` is enough.

Edit `.env.local`:

```env
GENLOOK_API_KEY=gk_your_key_here
GENLOOK_USE_MOCK=true
```

`GENLOOK_USE_MOCK=true` routes generations through the mock engine (free, instant, great for local testing). Uncheck the mock toggle in the UI or set the env var to `false` for real AI try-ons.

### 3. Run the demo

```bash
pnpm dev
```

Open [http://localhost:3600](http://localhost:3600), pick a product, and use the **Try it on** widget:

1. **Step 1** — upload your photo in the widget (`POST /images/upload` → `imageId`)
2. **Step 2** — click **Try it on** (`POST /try-on` with `customer.id`)
3. Browse another product — your photo is still saved, no re-upload needed

## Project structure

```text
virtual-try-on-api-example/
├── app/
│   ├── api/
│   │   ├── images/upload/route.ts   # Step 1: client.images.upload
│   │   ├── try-on/route.ts          # Step 2: client.tryOn.create (customer.id)
│   │   └── generations/[id]/route.ts # Step 3: poll status
│   ├── product/[id]/page.tsx        # product detail + try-on widget
│   └── page.tsx                     # product grid
├── components/
│   ├── CustomerPhotoProvider.tsx    # session imageId across pages
│   ├── TryOnWidget.tsx              # 2-step widget (upload + try-on)
│   └── AppShell.tsx                 # header + provider
├── data/products.json
├── lib/
│   ├── genlook.ts
│   ├── products.ts
│   └── api-errors.ts
└── public/products/
```

## SDK flow

```text
Browser                    Next.js API route              Genlook API
───────                    ─────────────────              ───────────
POST /api/images/upload →  client.images.upload()    →   POST /images/upload
                           ← imageId

POST /api/try-on        →  client.tryOn.create()     →   POST /try-on
  { productId, imageId }     customer: { id: imageId }

GET /api/generations/:id → client.generations.retrieve() → GET /generations/:id
```

## Mock engine

For development without spending credits, enable mock mode:

- Set `GENLOOK_USE_MOCK=true` in `.env.local`, or
- Keep the **Use mock engine** checkbox enabled in the UI

Mock mode sets `product.title` to `"mock"`, which returns the uploaded customer photo as the generated result in ~1–2 seconds.

## Links

- npm package: [@genlook/api](https://www.npmjs.com/package/@genlook/api)
- API introduction: [genlook.app/docs/tryon-api/introduction](https://genlook.app/docs/tryon-api/introduction)
- Quickstart: [genlook.app/docs/tryon-api/quickstart](https://genlook.app/docs/tryon-api/quickstart)
- Get an API key: [genlook.app/try-on/api](https://genlook.app/try-on/api)

## License

MIT
