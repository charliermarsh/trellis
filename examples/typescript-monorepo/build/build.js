import { Command, Image, Run } from "../../../typekit/src/index.js";
class NPM extends Command {
  constructor(command) {
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
let definition = Image.from(`node:${NODE_VERSION}`)
  .workDir("/root")
  // Copy over monorepo root configuration files.
  .copy("./tsconfig.build.json", "./")
  .copy("./package.json", "./")
  .copy("./package-lock.json", "./");
// Copy over workspace configuration files.
for (const workspace of WORKSPACES) {
  definition = definition.copy(
    `./${workspace}/package.json`,
    `./${workspace}/package.json`
  );
}
// Install dependencies.
definition = definition.with(new NPM("ci"));
// Copy over workspace contents.
for (const workspace of WORKSPACES) {
  definition = definition.copy(`./${workspace}`, `./${workspace}`);
}
// TODO(charlie): Add a push command.
export default definition;
