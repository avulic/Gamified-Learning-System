# Use Node.js 18 as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your project files into the container
COPY . .

EXPOSE 3000

# Set environment variables
ENV NODE_ENV=development

# Command to run your app in development mode
CMD ["npm", "run", "dev"]