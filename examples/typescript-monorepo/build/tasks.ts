import "https://deno.land/x/dotenv/load.ts";
import { WebClient } from "https://deno.land/x/slack_web_api/mod.js";
import { build, Image, run } from "../../../trellis/index.ts";
import buildStage from "./index.ts";

export default async function runChecks({ notify }: { notify?: boolean }) {
  const image = await build(buildStage);

  const checkFormat = Image.from(image).run(
    "npm run check-format --workspaces",
  );
  const checkTypes = Image.from(image).run(
    "npm run check-types --workspaces",
  );
  const checkLint = Image.from(image).run(
    "npm run check-lint --workspaces",
  );

  const result: Deno.ProcessStatus[] = await Promise.all([
    run(checkFormat),
    run(checkTypes),
    run(checkLint),
  ]);

  // Post to Slack.
  const slackToken = Deno.env.get("SLACK_TOKEN");
  const slackClient = slackToken ? new WebClient(slackToken) : null;

  const numFailures = result.filter((status) => !status.success).length;
  if (numFailures === 0) {
    if (slackClient && notify) {
      await slackClient.chat.postMessage({
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
    if (slackClient && notify) {
      await slackClient.chat.postMessage({
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
