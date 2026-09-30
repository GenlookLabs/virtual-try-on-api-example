# Virtual Try-On API example (Next.js)

A small storefront that adds virtual try-on to product pages with the [Genlook Try-On API](https://genlook.app/docs/tryon-api/introduction). A shopper uploads one photo, then sees any product of the catalog on themselves in about 10 seconds.

![A person photo and a trench coat, then the try-on result](docs/before-after.jpg)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FGenlookLabs%2Fvirtual-try-on-api-example&env=GENLOOK_API_KEY&envDescription=Your%20Genlook%20API%20key%20(10%20free%20credits%20on%20signup)&envLink=https%3A%2F%2Fplatform.genlook.app&project-name=virtual-try-on-example)

Want to see results before running anything? [Try it in the browser](https://huggingface.co/spaces/Genlook/virtual-try-on).

## How it works

1. **Upload the photo once.** `POST /images/upload` returns an `imageId`, kept for the whole session.
2. **Register each product once.** `POST /products` with the product image, title and description. Genlook analyzes it right away, so its first try-on is fast.
3. **Try on in one call.** `POST /try-on/sync` with the product `externalId` and the `imageId`. The result image comes back in the same request.

The demo registers a product the first time it is tried on (it retries after `PRODUCT_NOT_FOUND`), so there is no setup script. The browser only talks to Next.js API routes: your API key stays on the server.

## Run it locally

You need Node 20+ and an API key from [platform.genlook.app](https://platform.genlook.app). New accounts get 10 free credits, and each try-on costs 1 credit.

```bash
pnpm install
```

```bash
cp .env.example .env.local
```

Put your key in `.env.local`:

```env
GENLOOK_API_KEY=gk_your_key_here
```

```bash
pnpm dev
```

Open [http://localhost:3600](http://localhost:3600), pick a product, upload a photo and press **Try it on**.

Tick **Use mock engine** to test the flow without a real generation: it returns your photo unchanged, instantly. It still counts as a try-on.

## Where the code is

```text
app/api/images/upload/route.ts     # step 1: upload the photo (SDK: client.images.upload)
app/api/try-on/route.ts            # steps 2 and 3: register the product, POST /try-on/sync
app/api/generations/[id]/route.ts  # fallback when a try-on takes more than 90 s (202)
lib/genlook.ts                     # SDK client + the tryOnSync helper
components/TryOnWidget.tsx         # the try-on widget on the product page
data/products.json                 # the 5-product catalog
```

## Use it with your catalog

Replace `data/products.json` and the images in `public/products/`. Keep each `externalId` stable: it is how Genlook finds a product it has already analyzed. Send the full product title and description, they help the model understand what the item is and how it is cut.

## Links

- [Docs](https://genlook.app/docs/tryon-api/introduction) and [quickstart](https://genlook.app/docs/tryon-api/quickstart)
- [`POST /try-on/sync` reference](https://genlook.app/docs/tryon-api/endpoints/create-try-on-sync)
- [`@genlook/api` TypeScript SDK](https://www.npmjs.com/package/@genlook/api)
- [Pricing](https://genlook.app/developers#pricing): from $0.04 per try-on, monthly plans for volume
- [Try it in the browser](https://huggingface.co/spaces/Genlook/virtual-try-on)

Questions: hello@genlook.app

## License

MIT
