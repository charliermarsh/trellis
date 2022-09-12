import { build, run, Task } from "../../../typekit/src/index.js";
import definition from "./build.js";
import { WebClient } from "@slack/web-api";
export async function runChecks() {
  const web = new WebClient(process.env.SLACK_TOKEN);
  const image = await build(definition);
  const checkFormat = new Task(["npm", "run", "check-format", "--workspaces"]);
  const checkTypes = new Task(["npm", "run", "check-types", "--workspaces"]);
  const checkLint = new Task(["npm", "run", "check-lint", "--workspaces"]);
  const result = await Promise.all([
    run(checkFormat, image),
    run(checkTypes, image),
    run(checkLint, image),
  ]);
  // Post a message to the channel, and await the result.
  // Find more arguments and details of the response: https://api.slack.com/methods/chat.postMessage
  const x = await web.chat.postMessage({
    text: "Hello world!",
    channel: "#alerts",
  });
  // The result contains an identifier for the message, `ts`.
  console.log(`Successfully send message`);
  // Post to Slack.
  if (result.some((code) => code !== 0)) {
    console.error("Failed!");
  } else {
    console.error("Success!");
  }
}
await runChecks();
