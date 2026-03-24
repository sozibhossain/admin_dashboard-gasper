# Gasper Admin Dashboard

Next.js 16 admin panel built with shadcn-style components, NextAuth authentication, axios interceptors, TanStack Query, and Sonner toasts.

## Tech Stack

- Next.js App Router
- NextAuth (`/api/auth/[...nextauth]`)
- Axios (`lib/axios.ts`) with access token interceptor
- TanStack Query (`components/providers.tsx`)
- Sonner toast
- shadcn-style UI primitives in `components/ui/*`

## Environment

Copy `.env.example` to `.env.local` and update values:

```bash
cp .env.example .env.local
```

Important values:

- `NEXT_PUBLIC_BASE_URL` or `NEXT_PUBLIC_NEXTPUBLICBASEURL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

## Run

```bash
npm install
npm run dev
```

## Build Check

```bash
npm run lint
npm run build
```

## Project Structure

- `lib/api.ts` -> all API call functions
- `lib/axios.ts` -> axios client + token interceptor
- `lib/auth.ts` -> NextAuth credentials flow + token refresh
- `proxy.ts` -> route protection for admin pages
- `app/(auth)/*` -> login/forgot/verify/reset
- `app/(dashboard)/*` -> responsive admin pages
