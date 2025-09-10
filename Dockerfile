# Use Node.js official image
FROM node:18

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source code
COPY . .

# Expose API port
EXPOSE 4000

# Start server
CMD ["node", "server.js"]
