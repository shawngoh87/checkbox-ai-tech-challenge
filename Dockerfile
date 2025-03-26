FROM node:18.19.1-alpine as base

WORKDIR /usr/src/app

FROM base as deps

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --production

FROM deps as build

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .
RUN npm run build

FROM base as final

ENV NODE_ENV production
ENV DB_POSTGRES_HOST=database

USER node

COPY package.json .
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/src/server/infra/database/migrations ./src/server/infra/database/migrations
COPY --from=build /usr/src/app/src/server/infra/database/seeds ./src/server/infra/database/seeds
COPY --from=build /usr/src/app/kysely.config.ts ./kysely.config.ts
COPY --from=build /usr/src/app/vite.config.ts ./vite.config.ts

EXPOSE 3000

CMD ["sh", "-c", "npm run migrate:up && npm run seed && node dist/server/main.js"]
