import { Image } from "../../../typekit/src/index.js";
import { build } from "./build.js";

// TODO(charlie): We may want a custom task API here. What is a task? How do we run multiple tasks?
const checkFormat = Image.from(build).run("npm run check-format --workspaces");
const checkTypes = Image.from(build).run("npm run check-types --workspaces");
const checkLint = Image.from(build).run("npm run check-lint --workspaces");
const checkAll = Image.from(build)
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

export { checkFormat, checkTypes, checkLint, checkAll };
