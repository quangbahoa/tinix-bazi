# Build frontend (Vite) + run Express with static SPA from backendjs/public
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
COPY backendjs/package.json ./backendjs/

RUN npm ci

COPY frontend ./frontend
COPY backendjs ./backendjs

RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app

RUN apk add --no-cache sqlite nano

COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
COPY backendjs/package.json ./backendjs/

RUN npm ci --omit=dev

COPY backendjs ./backendjs
COPY --from=builder /app/frontend/dist ./backendjs/public

ENV NODE_ENV=production
WORKDIR /app/backendjs

EXPOSE 8888

CMD ["node", "server.js"]
