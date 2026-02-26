# Step 1: Build backend
FROM node:18 AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
# No build step if you don't have a build script for backend
# RUN npm run build

# Step 2: Build frontend
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Step 3: Create final image
FROM node:18
WORKDIR /app

# Copy backend
COPY --from=backend-build /app/backend ./backend
# Install backend dependencies
WORKDIR /app/backend
RUN npm install --production

# Copy frontend build
COPY --from=frontend-build /app/frontend/build ./frontend

# Expose a safe port
EXPOSE 3001

# Start backend
CMD ["node", "server.js"]