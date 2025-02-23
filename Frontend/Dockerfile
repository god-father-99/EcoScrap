# Use the official Node.js 18 image as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port on which your Next.js app will run (3001)
EXPOSE 3001

# Run the app using the provided host and port options
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0", "-p", "3001"]
