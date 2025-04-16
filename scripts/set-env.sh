#!/bin/bash

# Script to set environment variables for the build process

# Set the API URL environment variable
export NEXT_PUBLIC_API_URL="http://localhost:8888/api"

echo "Environment set: NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL"

# Execute the command passed as arguments
exec "$@" 