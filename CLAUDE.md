# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Habit Tracker API built with Node.js, Express, and PostgreSQL. It is a companion repository for the Frontend Masters course "API Design with Node.js, v5".

## Development Commands

### Running the Application
```bash
npm run dev        # Start development server with --watch flag (auto-reloads on changes)
npm start          # Start production server
```

### Testing
```bash
npm test           # Run all tests once with Vitest
npm run test:watch # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Docker & Database Management
```bash
# Docker Commands
docker compose up -d           # Start PostgreSQL and pgAdmin in background
docker compose down            # Stop all containers
docker compose down -v         # Stop and remove volumes (WARNING: deletes all data)
docker compose logs postgres   # View PostgreSQL logs
docker compose logs -f postgres # Follow PostgreSQL logs in real-time
docker compose ps              # List running containers
docker compose restart postgres # Restart PostgreSQL container

# Production Docker
docker compose -f docker-compose.prod.yml up -d  # Start production setup

# Database Management (Drizzle Kit)
npm run db:generate  # Generate migrations from schema changes
npm run db:migrate   # Apply pending migrations
npm run db:push      # Push schema changes directly to database (dev only)
npm run db:studio    # Open Drizzle Studio for database inspection
npm run db:seed      # Seed the database with sample data

# Access pgAdmin: http://localhost:5050
# Login with credentials from .env file (default: admin@habittracker.com / admin)
```

## Architecture

### Tech Stack
- **Runtime**: Node.js 23.6.0+ (uses native TypeScript support via `--watch` flag)
- **Framework**: Express v5
- **Database**: PostgreSQL 16 (running in Docker) with Drizzle ORM
- **Validation**: Zod (for both request validation and schema inference)
- **Authentication**: JWT (via `jose` library) + bcrypt for password hashing
- **Testing**: Vitest with supertest for API testing
- **Security**: helmet, cors, morgan for logging
- **Development Tools**: pgAdmin 4 (Docker), Drizzle Studio

### Project Structure
```
src/
├── index.ts              # Entry point - starts the server
├── server.ts             # Express app configuration, middleware setup, route mounting
├── db/
│   ├── schema.ts         # Drizzle schema definitions (users, habits, entries, tags, habitTags)
│   ├── connection.ts     # Database connection singleton using pg Pool and @epic-web/remember
│   └── seed.ts           # Database seeding script
├── middleware/
│   └── validation.ts     # Zod validation middleware (validateBody, validateParams, validateQuery)
└── routes/
    ├── authRoutes.ts     # Authentication endpoints (/api/auth/*)
    ├── habitRoutes.ts    # Habit management endpoints (/api/habits/*)
    └── userRoutes.ts     # User management endpoints (/api/users/*)
```

### Key Architectural Patterns

#### 1. Environment Configuration
- Uses `custom-env` for environment-specific `.env` file loading
- Environment variables are validated at startup using Zod schema (see `env.ts`)
- Supports three stages: `dev`, `test`, and `production` via `APP_STAGE` env var
- Required env vars: `DATABASE_URL`, `JWT_SECRET` (min 32 chars), `PORT`, `BCRYPT_ROUNDS`

#### 2. Database Schema (Drizzle ORM)
- **Tables**: `users`, `habits`, `entries`, `tags`, `habitTags`
- **Relations**: Users have many habits; habits have many entries and tags (through habitTags)
- Uses UUID primary keys with `defaultRandom()`
- Schema exports TypeScript types using `$inferSelect` and Zod schemas using `drizzle-zod`
- All foreign keys use `onDelete: 'cascade'`

#### 3. Request Validation
- Custom middleware functions: `validateBody()`, `validateParams()`, `validateQuery()`
- Takes Zod schema as argument and validates the corresponding request part
- Returns 400 with detailed error messages on validation failure
- Validated data is reassigned to `req.body/params/query` after parsing

#### 4. Route Organization
- Routes are mounted under `/api` prefix in server.ts
- Auth routes: `/api/auth/register`, `/api/auth/login`
- Habit routes: `/api/habits/*`
- User routes: `/api/users/*`
- Catch-all 404 handler for `/api/*` routes
- Fallback serves static HTML from `public/index.html`

#### 5. Database Connection Pattern
- Connection singleton in `src/db/connection.ts` using `drizzle-orm/node-postgres`
- Uses `@epic-web/remember` in development to maintain connection across hot reloads
- In production, creates a new Pool instance directly
- Schema is imported and passed to drizzle for type-safe queries
- Export pattern: `export const db = drizzle({ client, schema })`

#### 6. TypeScript Configuration
- Uses Node.js native TypeScript support (no compilation step)
- `rewriteRelativeImportExtensions: true` - allows omitting `.ts` in imports (rewrites at runtime)
- `erasableSyntaxOnly: true` - only allows type-only imports/exports to avoid runtime errors
- `module: "nodenext"` - ESM modules with Node.js resolution
- `noEmit: true` - no compilation, files are run directly
- `verbatimModuleSyntax: true` - strict import/export syntax
- `allowImportingTsExtensions: true` - allows `.ts` extensions in imports

#### 7. API Design Patterns (from API_DOCS.md)
- RESTful resource-based endpoints for CRUD operations
- Action endpoints for business logic (e.g., `/habits/:id/complete`)
- Data aggregation endpoints (e.g., `/habits/:id/stats` for streak calculations)
- JWT Bearer token authentication on protected routes
- Consistent error response format with `error` and `message` fields

### Important Implementation Details

1. **Import Extensions**: TypeScript imports can include `.ts` extensions (e.g., `import { app } from './server.ts'`), though the `rewriteRelativeImportExtensions` setting allows omitting them as they're rewritten at runtime

2. **Database Connection**: Connection singleton exists at `src/db/connection.ts` - exports `db` instance configured with Drizzle ORM. Uses `@epic-web/remember` to prevent connection churn during hot reloads in development

3. **Authentication Flow**: Routes may be stubs returning mock responses. Check implementation status before relying on authentication logic

4. **Test Setup**: Vitest is configured to run tests sequentially (`pool: 'threads'` with `singleThread: true`) to avoid database conflicts. A `globalSetup` file (`./tests/setup/globalSetup.ts`) is referenced in config - verify it exists before running tests

5. **CORS Configuration**: Currently allows `localhost:4142` as origin in the cors middleware. Adjust for production deployment or add additional allowed origins

6. **API Versioning**: Routes are currently under `/api` prefix without explicit version (e.g., no `/api/v1`). Consider this for future compatibility if API breaking changes are anticipated

## Common Development Workflows

### Adding a New Endpoint
1. Define Zod validation schema for request body/params/query
2. Add route handler in appropriate router file
3. Use validation middleware: `router.post('/path', validateBody(schema), handler)`
4. Test endpoint manually or write test in Vitest

### Modifying Database Schema
1. Edit `src/db/schema.ts` to add/modify tables or columns
2. Run `npm run db:generate` to create migration file
3. Run `npm run db:migrate` to apply migration
4. Update TypeScript types if needed (Drizzle auto-generates from schema)

### Adding Environment Variables
1. Add variable to `.env` file
2. Update `envSchema` in `env.ts` with Zod validation
3. Access via `env.VARIABLE_NAME` throughout the codebase

### Setting Up the Database for First Time
1. Copy `.env.example` to `.env`: `cp .env.example .env`
2. Update `DATABASE_URL` in `.env` with your credentials (default works with Docker setup)
3. Start PostgreSQL: `docker compose up -d`
4. Wait for database to be ready (check with `docker compose logs postgres`)
5. Generate and run migrations: `npm run db:generate && npm run db:migrate`
6. (Optional) Seed the database: `npm run db:seed`
7. (Optional) Access pgAdmin at http://localhost:5050 to inspect database

### Accessing Database
- **Drizzle Studio**: Run `npm run db:studio` for a web-based database browser
- **pgAdmin**: Access at http://localhost:5050 (credentials in `.env` file)
- **Direct SQL**: Connect using connection string from `DATABASE_URL` in `.env`
