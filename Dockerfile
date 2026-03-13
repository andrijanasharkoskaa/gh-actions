# Step 1: Build backend
FROM node:18 AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# Step 2: Build frontend
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Build React frontend and list the build folder to confirm it exists
RUN npm run build && ls -l build

# Step 3: Create final image
FROM node:18
WORKDIR /app

# Copy backend
COPY --from=backend-build /app/backend ./backend
WORKDIR /app/backend
RUN npm install --production

# Copy frontend build
COPY --from=frontend-build /app/frontend/build /app/frontend/build

# Expose new port
EXPOSE 3002

# Start backend
CMD ["node", "server.js"]