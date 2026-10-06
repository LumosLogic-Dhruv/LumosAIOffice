# ── Stage 1: build the main frontend ──────────────────────────────────────────
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ── Stage 2: build the platform admin ─────────────────────────────────────────
FROM node:20-alpine AS admin-build
WORKDIR /app
COPY platform-admin/package.json platform-admin/package-lock.json ./
RUN npm ci
COPY platform-admin/ ./
RUN npm run build

# ── Stage 3: serve both static apps with nginx ────────────────────────────────
FROM nginx:alpine
COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY --from=admin-build /app/dist /usr/share/nginx/html/platform
