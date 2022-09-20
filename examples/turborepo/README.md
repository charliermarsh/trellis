# Turborepo Docker starter

This is the official Docker starter Turborepo, modified for use with Trellis.

## Usage

To generate the Dockerfiles, run:

```shell
trellis preview trellis/web.ts > apps/web/Dockerfile
trellis preview trellis/api.ts > apps/api/Dockerfile
```

To build the Docker image with `docker-compose`, run:

```shell
COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose -f docker-compose.yml build
```
