import "https://deno.land/x/dotenv/load.ts";
import { WebClient } from "https://deno.land/x/slack_web_api/mod.js";
import { build, Image, run } from "../../../typekit/index.ts";
import buildStage from "./index.ts";

export async function runChecks({ notify }: { notify?: boolean }) {
  const baseImage = await build(buildStage);

  const checkFormat = Image.from(baseImage).run(
    "npm run check-format --workspaces",
  );
  const checkTypes = Image.from(baseImage).run(
    "npm run check-types --workspaces",
  );
  const checkLint = Image.from(baseImage).run(
    "npm run check-lint --workspaces",
  );

  // TODO(charlie): Enable remote builds.
  const result: Deno.ProcessStatus[] = await Promise.all([
    run(checkFormat),
    run(checkTypes),
    run(checkLint),
  ]);

  // Post to Slack.
  const web = new WebClient(Deno.env.get("SLACK_TOKEN"));

  // TODO(charlie): What if I want to extract a build artifact, like a JUnit file or a binary?
  const numFailures = result.filter((status) => !status.success).length;
  if (numFailures === 0) {
    if (notify) {
      await web.chat.postMessage({
        "attachments": [
          {
            "fallback": "Task `runChecks` succeeded",
            "title": "Task `runChecks` succeeded",
            "text": "Task completed without error.",
            "color": "good",
          },
        ],
        channel: "#alerts",
      });
    }
    Deno.exit(0);
  } else {
    if (notify) {
      await web.chat.postMessage({
        "attachments": [
          {
            "fallback": "Task `runChecks` failed",
            "title": "Task `runChecks` failed",
            "text": `Task completed ${numFailures} error(s).`,
            "color": "danger",
          },
        ],
        channel: "#alerts",
      });
    }
    Deno.exit(1);
  }
}
