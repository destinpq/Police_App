FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build application
RUN npm run build

# Show build contents for debugging
RUN ls -la
RUN ls -la dist

# Expose port
EXPOSE 4001

# Start application
CMD ["node", "dist/main"] 