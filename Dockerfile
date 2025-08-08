# Stage 1: Build the application
FROM node:22.14.0 AS development

# Set the working directory
WORKDIR /home

# Install rsync and zip (only needed for building serverless applications)
RUN apt-get update && apt-get install -y rsync zip && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Set the working directory for the application
WORKDIR /home/app

# Create a symbolic link to the node_modules directory
RUN ln -s /home/node_modules node_modules

# Copy the rest of the application code to the container
COPY . .

# Build the NestJS application
RUN npm run build

# Stage 2: Create the production image
FROM node:22.14.0-alpine AS production

# Set the working directory
WORKDIR /home/app

# Copy the built application from the development stage
COPY --from=development /home/app/dist ./dist
COPY --from=development /home/app/package*.json ./

# Copy file .env
COPY --from=development /home/app/.env ./

# Install only production dependencies
RUN npm ci --production && npm cache clean --force

# Expose the port the application will run on
EXPOSE 3000

# Command to run the application
CMD [ "npm", "run", "start:prod" ]
