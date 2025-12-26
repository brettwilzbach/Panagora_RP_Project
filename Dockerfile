# Use Node.js 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY risk-parity-portal/package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy application files
COPY risk-parity-portal/ ./

# Build the application
RUN npm run build

# Expose port (Railway will set PORT env var)
EXPOSE ${PORT:-4173}

# Start the server
CMD ["npm", "run", "start"]

