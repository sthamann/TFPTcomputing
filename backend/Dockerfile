FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Create .env file
RUN echo "NODE_ENV=production" > .env

# Expose port
EXPOSE 8000

# Run the application
CMD ["npm", "start"] 