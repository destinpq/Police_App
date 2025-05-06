# Deploying to Heroku

This guide outlines the steps to deploy the DestinPQ Task Tracker to Heroku with a PostgreSQL database.

## Prerequisites

- A Heroku account (sign up at [heroku.com](https://heroku.com) if you don't have one)
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed on your local machine
- Git installed on your local machine

## Step 1: Login to Heroku CLI

Open your terminal and login to the Heroku CLI:

```bash
heroku login
```

Follow the prompts to log in to your Heroku account.

## Step 2: Create a Heroku Application

Create a new Heroku application:

```bash
heroku create destinpq-task-tracker
```

This will create a new application named "destinpq-task-tracker" (you can choose a different name).

## Step 3: Set Up the PostgreSQL Database

Add a PostgreSQL database to your Heroku application:

```bash
heroku addons:create heroku-postgresql:mini --app destinpq-task-tracker
```

This will add a free tier PostgreSQL database to your application.

## Step 4: Configure Environment Variables

Set environment variables for your Heroku application:

```bash
# Set the Node environment to production
heroku config:set NODE_ENV=production --app destinpq-task-tracker

# Configure the client origin for CORS (replace with your frontend URL if needed)
heroku config:set CLIENT_ORIGIN=https://destinpq-task-tracker.herokuapp.com --app destinpq-task-tracker

# Configure the server URL
heroku config:set SERVER_URL=https://destinpq-task-tracker.herokuapp.com --app destinpq-task-tracker

# JWT Secret for authentication (replace with a secure random string)
heroku config:set JWT_SECRET=your_jwt_secret_here --app destinpq-task-tracker

# Email configuration (if needed)
heroku config:set MAIL_HOST=your_mail_host --app destinpq-task-tracker
heroku config:set MAIL_PORT=your_mail_port --app destinpq-task-tracker
heroku config:set MAIL_USER=your_mail_user --app destinpq-task-tracker
heroku config:set MAIL_PASSWORD=your_mail_password --app destinpq-task-tracker
```

## Step 5: Deploy the Application

Deploy your application to Heroku using Git:

```bash
# Initialize a Git repository if you haven't already
git init
git add .
git commit -m "Initial commit for Heroku deployment"

# Add the Heroku remote
heroku git:remote -a destinpq-task-tracker

# Push to Heroku
git push heroku main
```

If your main branch is named "master" instead of "main", use:

```bash
git push heroku master
```

## Step 6: Open the Application

Open your deployed application:

```bash
heroku open --app destinpq-task-tracker
```

## Additional Commands

### View Logs

To view the logs of your application:

```bash
heroku logs --tail --app destinpq-task-tracker
```

### Run Database Migrations

If you need to run database migrations manually:

```bash
heroku run "cd backend && npm run db:reset" --app destinpq-task-tracker
```

### Restart the Application

If you need to restart the application:

```bash
heroku restart --app destinpq-task-tracker
```

## Deploying Updates

To deploy updates to your Heroku application:

1. Commit your changes to Git:
   ```bash
   git add .
   git commit -m "Update description"
   ```

2. Push to Heroku:
   ```bash
   git push heroku main
   ```

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues, check your database connection string:

```bash
heroku config:get DATABASE_URL --app destinpq-task-tracker
```

### Application Crashing

If your application crashes, check the logs:

```bash
heroku logs --tail --app destinpq-task-tracker
```

### Frontend Not Connecting to Backend

Make sure your frontend is configured to connect to the correct backend URL. Check the environment variables:

```bash
heroku config:get CLIENT_ORIGIN --app destinpq-task-tracker
heroku config:get SERVER_URL --app destinpq-task-tracker
```

## Scaling

To scale your application (e.g., add more workers):

```bash
heroku ps:scale web=2 --app destinpq-task-tracker
```

## Conclusion

Your DestinPQ Task Tracker should now be successfully deployed to Heroku with a PostgreSQL database. You can access it at the URL provided by Heroku. 