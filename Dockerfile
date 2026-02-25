# Step 1: Build backend
FROM node:18 AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
RUN npm run build

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
COPY --from=backend-build /app/backend/dist ./backend
COPY --from=frontend-build /app/frontend/dist ./frontend

EXPOSE 3000
CMD ["node", "backend/server.js"]