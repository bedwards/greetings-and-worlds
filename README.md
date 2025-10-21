# greetings-and-worlds

[![CI](https://github.com/bedwards/greetings-and-worlds/actions/workflows/ci.yml/badge.svg)](https://github.com/bedwards/greetings-and-worlds/actions)
[![codecov](https://codecov.io/gh/bedwards/greetings-and-worlds/branch/main/graph/badge.svg)](https://codecov.io/gh/bedwards/greetings-and-worlds)

Interactive SQL demo with joinable greeting and audience tables. A "Hello world" example where you can write to and choose from greeting and audience tables, with SQL joins through a combo table.

**Live Demo:** https://bedwards.github.io/greetings-and-worlds

## Features

- **Read/Write SQL Database**: Create custom greetings and audiences
- **SQL Joins**: Combine greetings with audiences using a join table
- **Filter Combos**: Search through saved greeting-audience combinations
- **Real-time Updates**: Loading spinner with console feedback during operations
- **Cloudflare Workers**: Background queries through free Cloudflare Workers
- **Always-Free Database**: Supports multiple PostgreSQL-compatible cloud providers and local development

## Database Options

The application supports multiple always-free PostgreSQL databases:

### Cloud Options (Always Free)

- **Neon** (Recommended): 3 GB storage, 191.9 compute hours/month, instant branching
- **Supabase**: 500 MB database, 2 free projects, includes auth and storage
- **CockroachDB Serverless**: 5 GB storage, 250M request units/month, globally distributed

All three providers offer generous free tiers perfect for development and small production workloads.

### Local Development

Run PostgreSQL locally with Docker Compose:

```bash
docker-compose up -d
```

The local database runs on port 5432 with credentials in `docker-compose.yml`.

## Quick Start

### 1. Set Up Database

**Cloud Option (Neon):**

1. Create account at [neon.tech](https://neon.tech)
2. Create a new project (comes with default `neondb` database)
3. Copy connection string from dashboard
4. Run schema:

```bash
psql "your-connection-string" < schema.sql
```

**Local Option:**

```bash
docker-compose up -d
psql "postgresql://postgres:password@localhost:5432/greetings" < schema.sql
```

### 2. Deploy Cloudflare Worker

1. Create [Cloudflare account](https://dash.cloudflare.com/sign-up/workers-and-pages)
2. Install Wrangler: `npm install -g wrangler`
3. Login: `wrangler login`
4. Update `wrangler.toml` with your database connection string
5. Deploy: `wrangler deploy worker.js`

**Environment Variables:**

```bash
wrangler secret put DATABASE_URL
# Paste your connection string when prompted
```

### 3. Update Frontend

Edit `app.js` and set `API_BASE` to your Cloudflare Worker URL.

### 4. Deploy to GitHub Pages

1. Push code to GitHub repository named `greetings-and-worlds`
2. Enable GitHub Pages in repository settings (source: GitHub Actions)
3. The CI workflow automatically deploys on push to main

## Development

**Run Tests:**

```bash
npm test
```

**Watch Mode:**

```bash
npm run test:watch
```

**Coverage:**

```bash
npm run test:coverage
```

**Lint:**

```bash
npm run lint
```

## Architecture

The application uses a three-table schema with foreign key relationships:

- **greetings**: Stores greeting text (e.g., "Hello", "Hi")
- **audiences**: Stores audience text (e.g., "World", "Universe")
- **combos**: Join table with `greeting_id` and `audience_id`

The frontend is vanilla JavaScript with no framework dependencies. All database operations flow through Cloudflare Workers for security and connection pooling. The Worker handles CORS and database connections, keeping credentials server-side.

## Technology Stack

- **Frontend**: HTML, CSS, vanilla JavaScript
- **Backend**: Cloudflare Workers (free tier)
- **Database**: PostgreSQL-compatible (Neon, Supabase, CockroachDB)
- **Testing**: Vitest 3.2, happy-dom, 96% coverage
- **CI/CD**: GitHub Actions with Codecov integration
- **Deployment**: GitHub Pages (frontend), Cloudflare Workers (backend)

## API Endpoints

All endpoints are available through the Cloudflare Worker:

- `GET /api/greetings` - List all greetings
- `POST /api/greetings` - Create greeting
- `GET /api/audiences` - List all audiences
- `POST /api/audiences` - Create audience
- `GET /api/combos` - List combos with JOIN
- `POST /api/combos` - Create combo

## Testing

The project achieves 96% code coverage using Vitest and happy-dom. Tests cover DOM manipulation, API calls (mocked), filtering logic, and error handling. Run tests on macOS or Linux with Node.js 18+.

## Performance

Cloudflare Workers run in 300+ data centers worldwide with sub-50ms cold starts. Neon and Supabase provide connection pooling. The application handles concurrent requests efficiently with proper error handling and loading states.

## Contributing

This is a demo project showcasing SQL joins and full-stack architecture with free cloud services. The codebase prioritizes clarity and simplicity for educational purposes.

## Browser Support

Modern browsers (Chrome, Firefox, Safari). No legacy browser support required.
