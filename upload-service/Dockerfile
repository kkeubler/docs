# ---------- STAGE 1: Build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Nur package-Dateien kopieren (besseres Caching)
COPY package*.json ./
COPY tsconfig.json ./

# Dependencies installieren
RUN npm ci

# Quellcode kopieren und kompilieren
COPY src ./src
RUN npm run build


# ---------- STAGE 2: Runtime ----------
FROM node:20-alpine

WORKDIR /app

# Nur das Nötigste ins Laufzeit-Image übernehmen
COPY package*.json ./
RUN npm ci --omit=dev

# Kompilierte Dateien aus dem Builder holen
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.js"]
