# DestinPQ Task Tracker

A comprehensive task tracking application for DestinPQ, built with Next.js (frontend) and Nest.js (backend).

## Features

- User authentication and authorization
- Task creation, assignment, and management
- Project organization
- Task status tracking (To Do, In Progress, Done)
- Drag-and-drop task board
- Performance analytics and visualizations
- Admin dashboard for user management

## Tech Stack

### Frontend
- Next.js
- React
- Ant Design
- Recharts for analytics visualization
- CSS for styling

### Backend
- Nest.js
- TypeORM
- PostgreSQL
- JWT authentication

## Getting Started

### Prerequisites
- Node.js (v14+ recommended)
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/destinpq/Police_App.git
cd Police_App
```

2. Set up the backend
```bash
cd backend
npm install
# Create a .env file with your database configuration
npm run start:dev
```

3. Set up the frontend
```bash
cd frontend
npm install
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Environment Variables

Backend (.env file in backend directory):
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=tasktracker
JWT_SECRET=your_jwt_secret
```

## Deployment

The application can be deployed to a Digital Ocean droplet or any other hosting service that supports Node.js applications.

## License

This project is proprietary and owned by DestinPQ.

## Contact

For questions or support, contact your system administrator. 