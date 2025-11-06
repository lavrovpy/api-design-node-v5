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
npx drizzle-kit generate  # Generate migrations from schema changes
npx drizzle-kit migrate   # Apply pending migrations
npx drizzle-kit push      # Push schema changes directly to database (dev only)
npx drizzle-kit studio    # Open Drizzle Studio for database inspection

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
│   └── schema.ts         # Drizzle schema definitions (users, habits, entries, tags, habitTags)
├── middleware/
│   └── validation.ts     # Zod validation middleware (validateBody, validateParams, validateQuery)
└── routes/
    ├── authRoutes.ts     # Authentication endpoints (/api/auth/*)
    ├── habbitRoutes.ts   # Habit management endpoints (/api/habbits/*)
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
- Habit routes: `/api/habbits/*` (Note: typo in "habbits" is intentional in current code)
- User routes: `/api/users/*`
- Catch-all 404 handler for `/api/*` routes
- Fallback serves static HTML from `public/index.html`

#### 5. TypeScript Configuration
- Uses Node.js native TypeScript support (no compilation step)
- `allowImportingTsExtensions: true` - requires `.ts` extensions in imports
- `module: "nodenext"` - ESM modules with Node.js resolution
- `noEmit: true` - no compilation, files are run directly
- `verbatimModuleSyntax: true` - strict import/export syntax

#### 6. API Design Patterns (from API_DOCS.md)
- RESTful resource-based endpoints for CRUD operations
- Action endpoints for business logic (e.g., `/habits/:id/complete`)
- Data aggregation endpoints (e.g., `/habits/:id/stats` for streak calculations)
- JWT Bearer token authentication on protected routes
- Consistent error response format with `error` and `message` fields

### Important Implementation Details

1. **Import Extensions**: All TypeScript imports MUST include `.ts` extensions (e.g., `import { app } from './server.ts'`)

2. **Database Connection**: No database connection module exists yet - if implementing database operations, create a connection singleton in `src/db/index.ts` or similar

3. **Authentication Flow**: Routes are currently stubs returning mock responses. Actual JWT generation, password hashing, and authentication middleware need to be implemented

4. **Test Setup**: Vitest is configured to run tests sequentially (`singleThread: true`) to avoid database conflicts. A `globalSetup` file is referenced but does not exist yet

5. **CORS Configuration**: Currently allows `localhost:4142` as origin. Adjust for production deployment

6. **Route Naming**: Current code has "habbits" (with double 'b') in routes and file names - this is inconsistent with API documentation which uses "habits"

7. **API Versioning**: Routes are currently under `/api` prefix without explicit version. Consider `/api/v1` for future compatibility

## Common Development Workflows

### Adding a New Endpoint
1. Define Zod validation schema for request body/params/query
2. Add route handler in appropriate router file
3. Use validation middleware: `router.post('/path', validateBody(schema), handler)`
4. Test endpoint manually or write test in Vitest

### Modifying Database Schema
1. Edit `src/db/schema.ts` to add/modify tables or columns
2. Run `npx drizzle-kit generate` to create migration file
3. Run `npx drizzle-kit migrate` to apply migration
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
5. Generate and run migrations: `npx drizzle-kit generate && npx drizzle-kit migrate`
6. (Optional) Access pgAdmin at http://localhost:5050 to inspect database
