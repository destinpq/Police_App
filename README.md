# Task Tracker Online

A full-stack task management application built with Next.js and NestJS.

## Prerequisites

- Node.js (v18.0.0 or higher)
- Yarn (v1.22.22 or higher)

## Project Structure

This project uses Yarn Workspaces to manage both frontend and backend:

- `FE/` - Next.js frontend application
- `BE/` - NestJS backend API

## Getting Started

1. Install dependencies:

```bash
yarn
```

2. Start both frontend and backend in development mode:

```bash
yarn start
```

Or start them separately:

```bash
# Start frontend only
yarn start:fe

# Start backend only
yarn start:be
```

## Building for Production

```bash
# Build both frontend and backend
yarn build

# Or build them separately
yarn build:fe
yarn build:be
```

## Development

### Frontend (Next.js)

The frontend runs on port 7777 by default.

```bash
cd FE
yarn dev
```

### Backend (NestJS)

The backend runs on port 8888 by default.

```bash
cd BE
yarn start:dev
```

## Database Migrations

To handle database schema changes:

```bash
# Run migrations
yarn db:migrate:run

# Generate a new migration
yarn db:migrate:generate -n MigrationName

# Revert the last migration
yarn db:migrate:revert

# Fix data issues (specifically for projects with null startDate)
yarn db:fix
```

## Maintenance

### Cleaning the Project

To clean the project (remove node_modules, build artifacts, etc.):

```bash
yarn clean
```

This will remove:
- All node_modules directories
- Build outputs (.next, dist)
- package-lock.json files
- yarn-error.log files

After cleaning, you can reinstall dependencies with `yarn`.

## Linting

```bash
# Lint frontend
yarn lint:fe

# Lint backend
yarn lint:be
``` 