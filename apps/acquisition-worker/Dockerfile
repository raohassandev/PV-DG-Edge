FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml tsconfig*.json ./
COPY apps/acquisition-worker/package.json apps/acquisition-worker/package.json
COPY packages packages
RUN pnpm install --frozen-lockfile=false

COPY apps/acquisition-worker apps/acquisition-worker
RUN pnpm --filter @pvdg/acquisition-worker build

CMD ["pnpm", "--filter", "@pvdg/acquisition-worker", "start"]
