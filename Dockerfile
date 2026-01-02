# Use a lightweight Node.js image based on Alpine Linux
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and lock file first to leverage Docker cache
COPY package.json package-lock.json ./

# Install dependencies inside the container
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the Vite default port
EXPOSE 5173

# Start the application in development mode
CMD ["npm", "run", "dev"]