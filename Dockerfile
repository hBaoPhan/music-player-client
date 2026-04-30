# Stage 1: Build the React application
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Pass build arguments to environment variables so Vite can use them
ARG VITE_API_BASE_URL
ARG VITE_OAUTH2_GOOGLE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_OAUTH2_GOOGLE_URL=$VITE_OAUTH2_GOOGLE_URL

# Build the React app for production
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Copy custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output from the previous stage to Nginx's html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
