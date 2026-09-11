# --- Build stage -----------------------------------------------------
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# VITE_API_BASE_URL is baked into the JS bundle at build time (Vite env
# vars are compile-time). Leave it as /api/v1 for the bundled Nginx
# reverse-proxy setup below.
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# --- Serve stage -------------------------------------------------------
FROM nginx:1.27-alpine AS serve

# BACKEND_HOST/BACKEND_PORT are substituted into the config at container
# *start* time (via the official image's templating entrypoint), so the
# same image can point at different backends without a rebuild.
ENV BACKEND_HOST=backend
ENV BACKEND_PORT=8000

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/templates /etc/nginx/templates

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
