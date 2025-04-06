# Frontend Application

This is the frontend application for the task management system.

## Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Navigate to the frontend directory
cd FE

# Install dependencies
npm install
# or
yarn install
```

### Running in Development Mode

```bash
# Start the development server
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Environment Variables

The application uses the following environment variables:

- `NEXT_PUBLIC_API_URL`: The URL of the backend API
  - In development, the application will use local API routes at `/api`
  - In production, it will use the specified API URL or fallback to the DigitalOcean URL

## Local Development with Mock API

This application includes mock API routes in `app/api/` that provide sample data for development purposes. These routes are automatically used in development mode.

Available mock endpoints:
- `/api/tasks` - Get and create tasks
- `/api/projects` - Get and create projects

## Deployment

The application is configured for deployment on DigitalOcean App Platform. Deployment configurations are in:
- `.do/app.yaml` - DigitalOcean App Platform configuration
- `project.toml` - Build configuration

## Features

- Task Management with drag-and-drop functionality
- Project Management
- User-friendly UI with responsive design
- Team collaboration features

## Troubleshooting

If you encounter issues with API connections:
1. Check browser console for API URL being used
2. Verify the environment variables are set correctly
3. Check the network tab for request/response details

For development, the app uses mock API routes that provide sample data for testing. 