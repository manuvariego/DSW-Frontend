# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build the Angular application for production
# Output goes to dist/landing-page-angular17
RUN pnpm run build

# Production stage - serve with nginx
FROM nginx:alpine

# Copy built files from build stage to nginx html directory
# Angular 17+ puts files in browser/ subdirectory
COPY --from=build /app/dist/landing-page-angular17/browser /usr/share/nginx/html

# Expose port 80 (nginx default)
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
