#syntax=docker/dockerfile:1.4

FROM node:alpine AS stage-0
RUN apk update
WORKDIR /app
RUN yarn global add turbo
COPY --link . .
RUN turbo prune --scope=web --docker

FROM node:alpine AS stage-1
RUN apk update
WORKDIR /app
COPY --link .gitignore .gitignore
COPY --link --from=stage-0 /app/out/json/ .
COPY --link --from=stage-0 /app/out/yarn.lock ./yarn.lock
RUN yarn install
COPY --link --from=stage-0 /app/out/full/ .
COPY --link turbo.json turbo.json
RUN yarn turbo run build --filter=web...

FROM node:alpine AS stage-2
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
COPY --link --from=stage-1 /app/apps/web/next.config.js .
COPY --link --from=stage-1 /app/apps/web/package.json .
COPY --link --chown=nextjs:nodejs --from=stage-1 /app/apps/web/.next/standalone ./
COPY --link --chown=nextjs:nodejs --from=stage-1 /app/apps/web/.next/static ./apps/web/.next/static
CMD node apps/web/server.js
