import { Image } from "../../../trellis/mod.ts";
import { NPM } from "./commands.ts";

const NODE_VERSION = "18";
const WORKSPACES = ["app", "packages/core"];

let buildStage: Image = Image.from(`node:${NODE_VERSION}`)
  .withTag("crmarsh/typescript-monorepo:latest")
  .workDir("/root")
  // Copy over monorepo root configuration files.
  .copy("./tsconfig.build.json", "./")
  .copy("./package.json", "./")
  .copy("./package-lock.json", "./");

// Copy over workspace configuration files.
for (const workspace of WORKSPACES) {
  buildStage = buildStage.copy(
    `./${workspace}/package.json`,
    `./${workspace}/package.json`,
  );
}

// Install dependencies.
buildStage = buildStage.with(new NPM("ci"));

// Copy over workspace contents.
for (const workspace of WORKSPACES) {
  buildStage = buildStage.copy(`./${workspace}`, `./${workspace}`);
}

export default buildStage;
