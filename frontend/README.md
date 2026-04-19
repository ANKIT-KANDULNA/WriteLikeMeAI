This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Handwriting storage backend

Handwriting metadata storage is adapter-based and supports:

- `file` (default): stores jobs/fonts in `.data/handwriting/db.json`
- `mongodb`: stores jobs/fonts in MongoDB collections

Uploaded files and generated fonts remain on disk (`.data/handwriting/uploads`, `public/generated-fonts`).

### Environment variables

Use these in `frontend/.env.local`:

```bash
# default (or omit both):
HANDWRITING_STORE_DRIVER=file

# mongodb mode:
HANDWRITING_STORE_DRIVER=mongodb
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
MONGODB_DB_NAME=write_like_me_ai
```

If `HANDWRITING_STORE_DRIVER` is omitted and `MONGODB_URI` exists, MongoDB is used automatically.
"# WriteLikeMeAI" 
