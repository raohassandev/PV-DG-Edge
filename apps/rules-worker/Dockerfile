FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml tsconfig*.json ./
COPY apps/rules-worker/package.json apps/rules-worker/package.json
COPY packages packages
RUN pnpm install --frozen-lockfile=false

COPY apps/rules-worker apps/rules-worker
RUN pnpm --filter @pvdg/rules-worker build

CMD ["pnpm", "--filter", "@pvdg/rules-worker", "start"]
