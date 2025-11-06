-- This script runs automatically when the PostgreSQL container is first created
-- It sets up the initial database configuration

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schemas if needed (optional, currently using public schema)
-- CREATE SCHEMA IF NOT EXISTS habit_tracker;

-- Note: Drizzle ORM will handle table creation via migrations
-- This file is mainly for extensions and initial setup

-- You can add additional setup here such as:
-- - Creating additional databases for testing
-- - Setting up custom functions
-- - Configuring database settings
