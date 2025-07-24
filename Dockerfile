# ------------------------------
# Stage 1: Build Vite frontend
# ------------------------------
FROM node:20 AS frontend-builder

# Set working directory
WORKDIR /app/client

# Copy only necessary files for install
COPY client/package*.json ./
COPY client/tsconfig.json ./
COPY client/vite.config.mts ./

# Install deps
RUN npm install

# Copy the rest of the frontend
COPY client .

# Build production frontend assets
RUN npm run build


# ------------------------------
# Stage 2: Build backend and serve frontend
# ------------------------------
FROM node:20 AS backend

# Set root working dir
WORKDIR /app

# Copy backend package and root-level files
COPY server/package*.json ./server/
COPY package.json tsconfig.json drizzle.config.ts ./

# Install backend dependencies
WORKDIR /app/server
RUN npm install
RUN npm run build

# Copy the backend source after build for caching benefits
COPY server .

# Copy built frontend from previous stage into public dir
COPY --from=frontend-builder /app/client/dist ./public

EXPOSE 3000
CMD ["node", "dist/index.js"]
