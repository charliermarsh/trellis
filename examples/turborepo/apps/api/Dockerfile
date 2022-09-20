#syntax=docker/dockerfile:1.4

FROM node:alpine AS stage-0
RUN apk update
WORKDIR /app
RUN yarn global add turbo
COPY --link . .
RUN turbo prune --scope=api --docker

FROM node:alpine AS stage-1
RUN apk update
WORKDIR /app
COPY --link .gitignore .gitignore
COPY --link --from=stage-0 /app/out/json/ .
COPY --link --from=stage-0 /app/out/yarn.lock ./yarn.lock
RUN yarn install
COPY --link --from=stage-0 /app/out/full/ .
COPY --link turbo.json turbo.json
RUN yarn turbo run build --filter=api...

FROM node:alpine AS stage-2
WORKDIR /app
RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs
USER expressjs
COPY --link --from=stage-1 /app .
CMD node apps/api/dist/index.js
