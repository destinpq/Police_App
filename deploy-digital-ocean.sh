#!/bin/bash

# Set variables
DO_API_TOKEN="YOUR_DIGITAL_OCEAN_API_TOKEN"
APP_ID="YOUR_APP_ID" # Get this from your Digital Ocean App Platform URL

echo "Triggering Digital Ocean App Platform deployment..."

# Request a new deployment from the App Platform API
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DO_API_TOKEN" \
  "https://api.digitalocean.com/v2/apps/$APP_ID/deployments"

echo ""
echo "Deployment triggered. Check the Digital Ocean App Platform dashboard for progress." 