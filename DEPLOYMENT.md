# Vercel Deployment

## Before deploying

1. Keep secrets out of the repo.
2. Copy `.env.example` to `.env.local` for local development.
3. If your current OpenAI key has ever been committed, shared, or recorded, rotate it before deploying.
4. For production rate limiting on Vercel, create an Upstash Redis database and add its REST credentials to Vercel.

## Required environment variables

- `OPENAI_API_KEY`
- `OPENAI_MODEL` (optional, defaults to `gpt-5-nano`)
- `API_RATE_LIMIT_MAX_REQUESTS` (optional, defaults to `12`)
- `API_RATE_LIMIT_WINDOW_SECONDS` (optional, defaults to `300`)

## Recommended production rate-limit variables

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Without Upstash, the app falls back to in-memory rate limiting, which is fine for local development but not reliable across distributed Vercel serverless instances.

## Deploy with Vercel CLI

1. Run `npm run build` locally.
2. Install the CLI with `npm i -g vercel` if needed.
3. From the project root, run `vercel`.
4. Add the environment variables when prompted or later in the Vercel dashboard.
5. For production, run `vercel --prod`.

## Deploy with Git

This folder is not currently a git repository. If you want preview deployments and automatic redeploys:

1. Run `git init`.
2. Create a GitHub repository.
3. Push this project to GitHub.
4. Import the repository into Vercel.
5. Add the same environment variables in Project Settings -> Environment Variables.
6. Trigger a fresh deployment after the variables are saved.

## Security measures now in this app

- API secrets stay server-side through environment variables.
- `.env` files are ignored by git, while `.env.example` stays committed.
- All `/api/*` routes are rate limited.
- The chat API only accepts JSON and rejects oversized payloads.
- Chat input and history are length-limited on both client and server.
- API responses send `no-store` cache headers.
- Baseline security headers are applied across the app.

## Extra Vercel hardening worth enabling

1. Add a Vercel Firewall rate-limit rule for `/api/*` so abusive traffic is blocked before it reaches your function.
2. Restrict who can edit production environment variables in your Vercel project.
3. Review Function logs after deploy to confirm there are no repeated 4xx/5xx spikes.
