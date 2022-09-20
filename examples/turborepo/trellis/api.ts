/**
 * Trellis definition for apps/api.
 */
import { Image } from "../../../trellis/index.ts";
import { buildApp, NODE_VERSION } from "./shared.ts";

const appArtifact = buildApp("api").saveArtifact("/app");

const runStage = Image.from(`node:${NODE_VERSION}`)
  .workDir("/app")
  .run("addgroup --system --gid 1001 expressjs")
  .run("adduser --system --uid 1001 expressjs")
  .user("expressjs")
  .copyArtifact(appArtifact, ".")
  .cmd("node apps/api/dist/index.js");

export default runStage;
