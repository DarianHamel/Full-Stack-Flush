# Use official Node.js image
FROM node:20 as builder

# Set working directory inside container
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the frontend code
COPY . .

# Build the React/Vite app
RUN npm run build

# Use Nginx for serving the frontend
FROM nginx:alpine

# Copy built frontend files to Nginx server
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
