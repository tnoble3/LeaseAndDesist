# Use Node LTS version
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all other project files
COPY . .

# Expose backend port
EXPOSE 5000

# Start backend using nodemon (for dev)
CMD ["npm", "run", "dev"]
