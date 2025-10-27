# Use Node 22 base image
FROM node:22

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Expose backend port
EXPOSE 5000

# Start the backend
CMD ["npm", "run", "start"]
