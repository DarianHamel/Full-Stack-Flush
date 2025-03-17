# Use an official Node.js runtime as the base image
FROM node:20

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for both server and client
COPY server/package*.json ./server/
COPY client/package*.json ./client/
COPY package*.json ./

# Install root dependencies (if any)
RUN npm ci

# Install server dependencies
RUN cd server && npm ci

# Install client dependencies
RUN cd client && npm ci

# Copy the rest of the application code
COPY . .

# Build the client
RUN cd client && npm run build --if-present

# Expose the ports the server and client run on
EXPOSE 5050  # Server port
EXPOSE 5173  # Client port

# Set the command to start the server and client
CMD ["sh", "-c", "cd server && npm start & cd ../client && npm run dev"]
