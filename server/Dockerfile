# Use official Node.js image
FROM node:20

# Set working directory inside container
WORKDIR /app

# Copy only package.json and package-lock.json first to optimize Docker caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Expose port (should match the one in server.js)
EXPOSE 5050

# Start the server
CMD ["node", "server.js"]
