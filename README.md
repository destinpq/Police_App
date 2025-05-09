# Police Task Tracker Application

A comprehensive task tracking application for police departments.

## Structure

This project consists of two main components:

- **Backend**: NestJS API with PostgreSQL database
- **Frontend**: React-based web interface

## Development

The backend is hosted in the `backend/` directory and runs independently. All configuration is stored in `.env` files.

## Deployment

This application is deployed to Digital Ocean App Platform. The backend is configured to use Digital Ocean PostgreSQL.

## Configuration

Configuration is loaded from environment variables which can be set in the `.env` file for local development or in the Digital Ocean App Platform for production.

### Database Configuration
- DB_HOST
- DB_PORT
- DB_USERNAME
- DB_PASSWORD
- DB_DATABASE
- DB_SSL
- DB_SSL_MODE

### Mail Configuration
- MAIL_HOST
- MAIL_PORT
- MAIL_SECURE
- MAIL_USER
- MAIL_PASSWORD
- MAIL_FROM

## License

Proprietary software of DestinPQ - All rights reserved. 