#syntax=docker/dockerfile:1.4

FROM node:18 AS stage-0
WORKDIR /root
COPY --link ./tsconfig.build.json ./
COPY --link ./package.json ./
COPY --link ./package-lock.json ./
COPY --link ./app/package.json ./app/package.json
COPY --link ./packages/core/package.json ./packages/core/package.json
RUN --mount=type=cache,target=/root/.cache/npm npm set cache /root/.cache/npm && npm ci
COPY --link ./app ./app
COPY --link ./packages/core ./packages/core

FROM stage-0 AS stage-1
RUN npm run check-format --workspaces

FROM stage-0 AS stage-2
RUN npm run check-types --workspaces

FROM stage-0 AS stage-3
RUN npm run check-lint --workspaces

FROM stage-0 AS stage-4
COPY --link --from=stage-1 /root/package.json /root/check-format.json
COPY --link --from=stage-2 /root/package.json /root/check-types.json
COPY --link --from=stage-3 /root/package.json /root/check-lint.json
