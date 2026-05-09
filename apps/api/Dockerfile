FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml tsconfig*.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages packages
RUN pnpm install --frozen-lockfile=false

COPY apps/api apps/api
COPY database database
RUN pnpm --filter @pvdg/api build

EXPOSE 3000
CMD ["pnpm", "--filter", "@pvdg/api", "start"]
