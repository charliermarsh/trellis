#syntax=docker/dockerfile:1.4

FROM node:18 AS stage-0
WORKDIR /root
COPY --link ./tsconfig.build.json ./
COPY --link ./package.json ./
COPY --link ./package-lock.json ./
COPY --link ./app/package.json ./app/package.json
COPY --link ./packages/core/package.json ./packages/core/package.json
RUN --mount=type=cache,target=/.cache/npm npm set cache /.cache/npm && npm ci
COPY --link ./app ./app
COPY --link ./packages/core ./packages/core
