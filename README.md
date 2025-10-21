# Greetings and Worlds

[![CI](https://github.com/bedwards/greetings-and-worlds/actions/workflows/ci.yml/badge.svg)](https://github.com/bedwards/greetings-and-worlds/actions)
[![codecov](https://codecov.io/gh/bedwards/greetings-and-worlds/branch/main/graph/badge.svg)](https://codecov.io/gh/bedwards/greetings-and-worlds)

Interactive SQL demonstration featuring joinable greeting and audience tables. A "Hello World" example showcasing database operations, SQL joins, and full-stack architecture with vanilla JavaScript, Cloudflare Workers, and PostgreSQL.

**Live Demo:** https://bedwards.github.io/greetings-and-worlds

## Local Development

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- npm or compatible package manager

### Quick Start

Install dependencies:
```bash
npm ci
```

### Checks

Run the full test suite (linting, tests, coverage) that matches the GitHub Actions workflow:
```bash
npm run check
```

Individual commands:
```bash
npm run lint           # ESLint
npm test              # Vitest tests
npm run test:coverage # Coverage report
npm run test:watch    # Watch mode
```

### Database

Start PostgreSQL in Docker:
```bash
docker-compose up -d
```

Import schema and seed data:
```bash
psql "postgresql://postgres:password@localhost:5432/greetings" < schema.sql
```

Connect to interactive psql client:
```bash
psql "postgresql://postgres:password@localhost:5432/greetings"
```

Verify tables and data:
```sql
greetings=# \d
                List of relations
 Schema |       Name       |   Type   |  Owner
--------+------------------+----------+----------
 public | audiences        | table    | postgres
 public | audiences_id_seq | sequence | postgres
 public | combos           | table    | postgres
 public | combos_id_seq    | sequence | postgres
 public | greetings        | table    | postgres
 public | greetings_id_seq | sequence | postgres

greetings=# select * from audiences;
 id |   text   |         created_at
----+----------+----------------------------
  1 | World    | 2025-10-21 13:37:09.418823
  2 | Universe | 2025-10-21 13:37:09.418823
  3 | Galaxy   | 2025-10-21 13:37:09.418823
```

### Cloudflare Worker (API)

The `.dev.vars` file configures local development environment variables. Start the worker:
```bash
wrangler dev
```

Expected output:
```
Using vars defined in .dev.vars
Binding                            Resource                  Mode
env.DATABASE_URL ("(hidden)")      Environment Variable      local
env.API_BASE ("(hidden)")          Environment Variable      local
[wrangler:info] Ready on http://localhost:8787
```

### Frontend Server

Start HTTP server for the frontend:
```bash
npx http-server -p 8000
```

### Open in Browser

Navigate to http://localhost:8000/

The app automatically detects localhost and connects to the local worker at `http://localhost:8787`, which connects to your local PostgreSQL database.

## Production Deployment

### Database

The application supports any PostgreSQL-compatible database. Free options include:
- **Neon**: 3 GB storage, 191.9 compute hours/month
- **Supabase**: 500 MB database, 2 free projects
- **CockroachDB Serverless**: 5 GB storage, 250M request units/month

Create a database and run the schema:
```bash
psql "your-connection-string" < schema.sql
```

### Cloudflare Worker

Install Wrangler globally:
```bash
npm install -g wrangler
```

Login and deploy:
```bash
wrangler login
wrangler secret put DATABASE_URL  # Paste your production connection string
wrangler deploy --env production
```

Ignore the following warning (`node_modules` is needed to import `pg` in local dev):

```
Unexpected fields found in top-level field: "node_modules"
```

### GitHub Pages

The repository includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that automatically:
1. Runs tests and linting on every push
2. Generates coverage reports and uploads to Codecov
3. Deploys the frontend to GitHub Pages on main branch pushes

Enable GitHub Pages in repository settings with source set to "GitHub Actions".

## Architecture

**Database Schema**: Three tables with foreign key relationships:
- `greetings`: Stores greeting text with auto-incrementing ID
- `audiences`: Stores audience text with auto-incrementing ID  
- `combos`: Join table linking greeting_id and audience_id

**Frontend**: Vanilla JavaScript (`app.js`) with no framework dependencies. Environment detection automatically routes requests to local worker during development or production worker URL when deployed.

**Backend**: Cloudflare Worker (`worker.js`) using the standard `pg` library with `nodejs_compat` compatibility flag. Handles CORS, database connections, and all API endpoints.

**Testing**: Vitest with happy-dom environment. Coverage thresholds: 85% statements, 84% branches, 93% functions, 85% lines.

## API Endpoints

All endpoints served through the Cloudflare Worker:

- `GET /api/greetings` - List all greetings
- `POST /api/greetings` - Create greeting (`{"text": "Hello"}`)
- `GET /api/audiences` - List all audiences
- `POST /api/audiences` - Create audience (`{"text": "World"}`)
- `GET /api/combos` - List combos with JOIN query
- `POST /api/combos` - Create combo (`{"greeting_id": 1, "audience_id": 1}`)

## Technology Stack

- **Frontend**: HTML5, CSS3, vanilla JavaScript
- **Backend**: Cloudflare Workers (free tier: 100k requests/day)
- **Database**: PostgreSQL 17 (Docker locally, any Postgres-compatible service in production)
- **Testing**: Vitest 3.2, happy-dom 18.0
- **CI/CD**: GitHub Actions with Codecov integration
- **Deployment**: GitHub Pages (frontend), Cloudflare Workers (backend)

## Browser Support

Modern browsers with ES6 support (Chrome, Firefox, Safari, Edge).
