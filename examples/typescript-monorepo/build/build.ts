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

// Define a variety of checks.
// TODO(charlie): We may want a custom task API here. What is a task? How do we run multiple tasks?
const checkFormat = Image.from(buildStage).run(
  "npm run check-format --workspaces"
);
const checkTypes = Image.from(buildStage).run(
  "npm run check-types --workspaces"
);
const checkLint = Image.from(buildStage).run("npm run check-lint --workspaces");
const checkAll = Image.from(buildStage)
  .copyArtifact(
    checkFormat.saveArtifact("/root/package.json"),
    "/root/check-format.json"
  )
  .copyArtifact(
    checkTypes.saveArtifact("/root/package.json"),
    "/root/check-types.json"
  )
  .copyArtifact(
    checkLint.saveArtifact("/root/package.json"),
    "/root/check-lint.json"
  );

export { buildStage as build, checkFormat, checkTypes, checkLint, checkAll };
