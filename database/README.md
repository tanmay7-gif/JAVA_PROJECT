# FitPulse Database Layer

This directory centralizes all database schemas, seed datasets, and migration scripts for the FitPulse platform.

## Directory Structure
- `schema.prisma`: Universal Prisma schema configured for SQLite and PostgreSQL.
- `schema.sql`: Raw ANSI SQL migration script with constraints and indexes for PostgreSQL/MySQL.
- `seed.ts`: Comprehensive TypeScript database seeder pre-populating athletes, workouts, challenges, and system settings.
- `dev.db`: Ready-to-use local SQLite database for zero-config local development.

## Seeding the Database
From the project root:
```bash
npm run db:seed
```

Or directly via Prisma:
```bash
npx prisma db push --schema=./database/schema.prisma
npx tsx ./database/seed.ts
```

## Default Seed Accounts
| Account | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Athlete** | `sarah@fitpulse.com` | `User123!` | `USER` |
| **Admin** | `admin@fitpulse.com` | `Admin123!` | `ADMIN` |
