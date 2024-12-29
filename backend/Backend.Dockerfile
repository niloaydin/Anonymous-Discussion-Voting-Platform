# Backend Dockerfile

FROM node:16

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend files
COPY . . 

# Set the working directory to /app/src
WORKDIR /app/src

# Expose the port used by the app
EXPOSE 3000

# Start the application
CMD ["node", "app.js"]
