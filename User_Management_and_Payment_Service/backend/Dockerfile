# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (for better layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of the source code
COPY . .

# Expose the port your app runs on
EXPOSE 5003

# Start the app
CMD ["npm", "start"]