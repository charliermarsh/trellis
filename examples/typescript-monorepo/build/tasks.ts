import "https://deno.land/x/dotenv/load.ts";
import { WebClient } from "https://deno.land/x/slack_web_api/mod.js";
import { build, Image, run } from "../../../typekit/index.ts";
import buildStage from "./build.ts";

export async function runChecks() {
  const image = await build(buildStage, "typekit:latest");

  const checkFormat = Image.from(image).run(
    "npm run check-format --workspaces",
  );
  const checkTypes = Image.from(image).run("npm run check-types --workspaces");
  const checkLint = Image.from(image).run("npm run check-lint --workspaces");

  // TODO(charlie): Enable remote builds.
  const result: Deno.ProcessStatus[] = await Promise.all([
    run(checkFormat),
    run(checkTypes),
    run(checkLint),
  ]);

  // Post to Slack.
  const web = new WebClient(Deno.env.get("SLACK_TOKEN"));

  // TODO(charlie): What if I want to extract a build artifact, like a JUnit file or a binary?
  if (result.every((status) => status.success)) {
    await web.chat.postMessage({
      text: "Success!",
      channel: "#alerts",
    });
    console.log("Success!");
  } else {
    await web.chat.postMessage({
      text: "Failure!",
      channel: "#alerts",
    });
    console.error("Failure!");
  }
}

await runChecks();
