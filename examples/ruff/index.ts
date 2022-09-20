import { Image } from "../../trellis/index.ts";
import { BuildCargoProject } from "./commands.ts";

const buildStage = Image.from("rust:1.63")
  .workDir("/usr/src/ruff")
  // Build project.
  .with(new BuildCargoProject("ruff"))
  // Copy over auxiliary resources.
  .copy("ruff/resources", "resources")
  .copy("ruff/pyproject.toml", "pyproject.toml");

const devStage = Image.from(buildStage)
  .run("rustup component add clippy")
  .run("rustup component add rustfmt");

export { buildStage, devStage };
