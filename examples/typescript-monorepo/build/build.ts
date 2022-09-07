import { Image, Command, Run } from "../../../typekit/src/index.js";

export class NPM extends Command {
  constructor(command: string) {
    super([
      new Run(`npm set cache /root/.cache/npm && npm ${command}`, [
        {
          type: "cache",
          target: "/root/.cache/npm",
        },
      ]),
    ]);
  }
}

const NODE_VERSION = "18";
const WORKSPACES = ["app", "packages/core"];

let buildStage = Image.from(`node:${NODE_VERSION}`)
  .workDir("/root")
  // Copy over monorepo root configuration files.
  .copy("./tsconfig.build.json", "./")
  .copy("./package.json", "./")
  .copy("./package-lock.json", "./");

// Copy over workspace configuration files.
for (const workspace of WORKSPACES) {
  buildStage = buildStage.copy(
    `./${workspace}/package.json`,
    `./${workspace}/package.json`
  );
}

// Install dependencies.
buildStage = buildStage.with(new NPM("ci"));

// Copy over workspace contents.
for (const workspace of WORKSPACES) {
  buildStage = buildStage.copy(`./${workspace}`, `./${workspace}`);
}

export { buildStage as build };
