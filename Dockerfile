# Use an official Node.js runtime as the base image
FROM node:20

# Set the working directory
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
RUN cd client && npm run build

# Install a lightweight static file server
RUN npm install -g serve

# Expose necessary ports
EXPOSE 5050  
EXPOSE 5173  

# Start both server and client properly
CMD ["sh", "-c", "cd server && npm start & serve -s client/dist -l 5173"]
