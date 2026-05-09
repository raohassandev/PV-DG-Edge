FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml tsconfig*.json ./
COPY apps/aggregation-worker/package.json apps/aggregation-worker/package.json
COPY packages packages
RUN pnpm install --frozen-lockfile=false

COPY apps/aggregation-worker apps/aggregation-worker
RUN pnpm --filter @pvdg/aggregation-worker build

CMD ["pnpm", "--filter", "@pvdg/aggregation-worker", "start"]
