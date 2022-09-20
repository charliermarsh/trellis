/**
 * Trellis definition for apps/web.
 */
import { Image } from "../../../trellis/index.ts";
import { buildApp, NODE_VERSION } from "./shared.ts";

const buildStage = buildApp("web");

const configArtifact = buildStage.saveArtifact(
  "/app/apps/web/next.config.js",
);
const packageJsonArtifact = buildStage.saveArtifact(
  "/app/apps/web/package.json",
);
const standaloneArtifact = buildStage.saveArtifact(
  "/app/apps/web/.next/standalone",
);
const staticArtifact = buildStage.saveArtifact("/app/apps/web/.next/static");

const runStage = Image.from(`node:${NODE_VERSION}`)
  .workDir("/app")
  .run("addgroup --system --gid 1001 nodejs")
  .run("adduser --system --uid 1001 nextjs")
  .user("nextjs")
  .copyArtifact(configArtifact, ".")
  .copyArtifact(packageJsonArtifact, ".")
  .copyArtifact(standaloneArtifact, "./", { user: "nextjs", group: "nodejs" })
  .copyArtifact(staticArtifact, "./apps/web/.next/static", {
    user: "nextjs",
    group: "nodejs",
  })
  .cmd("node apps/web/server.js");

export default runStage;
