# Use Node.js as base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Expose port (same as your Express server)
EXPOSE 5050

# Start the server
CMD ["node", "server.js"]

