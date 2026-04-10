# ---- Dependencies ----
FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ---- Build ----
FROM oven/bun:1-alpine AS build
WORKDIR /app
ARG VITE_HA_URL
ARG VITE_HA_TOKEN
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN : "${VITE_HA_URL:?Build argument VITE_HA_URL is required}" \
    && : "${VITE_HA_TOKEN:?Build argument VITE_HA_TOKEN is required}" \
    && bun run build

# ---- Runtime ----
FROM nginx:1.28-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
