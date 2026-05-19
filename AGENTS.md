# FCN - Healthcare Management System

## Project Structure

This is a monorepo with two distinct services:
- **Frontend**: Next.js 16.2.4 App Router (port 3000)
- **API**: Express.js server (port 4000)

## Running the Project

```bash
# Start all services (requires Docker)
docker-compose up

# Or run individually:
pnpm run dev          # Next.js frontend (port 3000)
node src/api/index.ts # Express API (port 4000)
```

## Required Services

- PostgreSQL (port 5432) - via Docker or local
- Redis (port 6379) - via Docker or local
- Create `.env` with `DATABASE_URL` and `REDIS_URL`

## Database

```bash
pnpm prisma generate   # Generate Prisma client
pnpm prisma db push    # Push schema to DB
pnpm prisma db seed    # Seed initial data
```

## Build & Test

```bash
pnpm run lint    # ESLint
pnpm run build   # Next.js build
```

Note: CI runs `pnpm run test` but no test script is defined in package.json.

## Key Conventions

- API routes: `src/api/routes/`, controllers in `src/api/controllers/`
- Frontend pages: `src/app/[route]/page.tsx`
- API uses Prisma directly (not through Next.js API routes)
- Socket.IO for real-time features (src/api/services/socketService.ts)

<!-- END:nextjs-agent-rules -->
