import { build, run, Task } from "../../../typekit/index.ts";
import definition from "./build.ts";
import { WebClient } from "https://deno.land/x/slack_web_api/mod.js";
import "https://deno.land/x/dotenv/load.ts";

export async function runChecks() {
  const web = new WebClient(Deno.env.get("SLACK_TOKEN"));
  await web.chat.postMessage({
    text: "Hello world!",
    channel: "#alerts",
  });

  const image = await build(definition);

  const checkFormat = new Task(["npm", "run", "check-format", "--workspaces"]);
  const checkTypes = new Task(["npm", "run", "check-types", "--workspaces"]);
  const checkLint = new Task(["npm", "run", "check-lint", "--workspaces"]);

  const result: Deno.ProcessStatus[] = await Promise.all([
    run(checkFormat, image),
    run(checkTypes, image),
    run(checkLint, image),
  ]);

  // Post to Slack.
  if (result.every((status) => status.success)) {
    console.log("Success!");
  } else {
    console.error("Failed!");
  }
}

await runChecks();
