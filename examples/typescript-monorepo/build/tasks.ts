import { build, run, Task } from "../../../typekit/src/index.js";
import definition from "./build.js";

export async function runChecks() {
  const image = await build(definition);
  console.log("BUILT IMAGE");

  const checkFormat = new Task(["npm", "run", "check-format", "--workspaces"]);
  const checkTypes = new Task(["npm", "run", "check-types", "--workspaces"]);
  const checkLint = new Task(["npm", "run", "check-lint", "--workspaces"]);

  const result = await Promise.all([
    run(checkFormat, image),
    run(checkTypes, image),
    run(checkLint, image),
  ]);

  console.log(result);

  // Post to Slack.
}

runChecks();
