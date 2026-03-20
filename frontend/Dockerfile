# --- Stage 1: Build ---
FROM node:24-alpine AS builder
WORKDIR /app

# Cache dependencies for faster rebuilds
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# --- Stage 2: Production ---
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copy ONLY the static build artifacts from the builder stage
COPY --from=builder /app/dist . 

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]