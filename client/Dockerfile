# Use Node.js as base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Serve the build files using a simple HTTP server
RUN npm install -g serve
CMD ["serve", "-s", "dist"]

# Expose React default port
EXPOSE 3000
