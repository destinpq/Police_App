# Deploying to Digital Ocean

This guide outlines the steps to deploy the DestinPQ Task Tracker to a Digital Ocean droplet without using Docker.

## Prerequisites

- A Digital Ocean account
- A domain name (optional, but recommended)
- Basic knowledge of Linux commands
- SSH access to your server

## Step 1: Create a Digital Ocean Droplet

1. Log in to your Digital Ocean account
2. Click "Create" and select "Droplets"
3. Choose a Ubuntu 22.04 (LTS) x64 image
4. Select a plan (Recommended: Basic with at least 2GB RAM)
5. Choose a datacenter region closest to your users
6. Add your SSH keys (recommended) or set up a password
7. Click "Create Droplet"

## Step 2: Set Up the Server

Connect to your server using SSH:

```bash
ssh root@your_server_ip
```

Update the server and install necessary dependencies:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs npm postgresql postgresql-contrib nginx ufw
```

Install Node.js 16+ and npm:

```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Verify the installation:

```bash
node -v
npm -v
```

## Step 3: Set Up PostgreSQL

Start PostgreSQL:

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Create a database and user:

```bash
sudo -i -u postgres
psql
```

In the PostgreSQL prompt:

```sql
CREATE DATABASE tasktracker;
CREATE USER taskuser WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE tasktracker TO taskuser;
\q
```

Exit the PostgreSQL user:

```bash
exit
```

## Step 4: Clone the Repository

Install Git:

```bash
sudo apt install git
```

Clone the repository:

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/destinpq/Police_App.git tasktracker
cd tasktracker
```

## Step 5: Set Up the Backend

Navigate to the backend directory:

```bash
cd backend
```

Create a .env file:

```bash
nano .env
```

Add the environment variables (replace with your actual values):

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=taskuser
DB_PASSWORD=your_secure_password
DB_DATABASE=tasktracker
JWT_SECRET=your_very_secure_jwt_secret
```

Install dependencies and build the backend:

```bash
npm install
npm run build
```

## Step 6: Set Up the Frontend

Navigate to the frontend directory:

```bash
cd ../frontend
```

Install dependencies and build the frontend:

```bash
npm install
npm run build
```

## Step 7: Set Up PM2 for Process Management

Install PM2 globally:

```bash
sudo npm install -g pm2
```

Create a PM2 ecosystem file:

```bash
nano ecosystem.config.js
```

Add the following configuration:

```javascript
module.exports = {
  apps: [
    {
      name: "tasktracker-backend",
      cwd: "/var/www/tasktracker/backend",
      script: "dist/main.js",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "tasktracker-frontend",
      cwd: "/var/www/tasktracker/frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
```

Start the applications:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Step 8: Configure Nginx as a Reverse Proxy

Create an Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/tasktracker
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your_domain_or_ip;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/tasktracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 9: Configure Firewall

Configure UFW to allow Nginx and SSH:

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow 'OpenSSH'
sudo ufw enable
```

## Step 10: Set Up SSL with Let's Encrypt (Optional)

If you have a domain name, you can secure your application with Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your_domain.com
```

## Step 11: Updating the Application

To update the application when you push new changes to GitHub:

```bash
cd /var/www/tasktracker
git pull origin main

# Update backend
cd backend
npm install
npm run build
pm2 restart tasktracker-backend

# Update frontend
cd ../frontend
npm install
npm run build
pm2 restart tasktracker-frontend
```

## Troubleshooting

- Check PM2 logs: `pm2 logs`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Restart services: `sudo systemctl restart nginx` and `pm2 restart all`

## Conclusion

Your DestinPQ Task Tracker should now be running on your Digital Ocean droplet without Docker. You can access it via your domain name or server IP address. 