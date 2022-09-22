import { Image } from "../../trellis/mod.ts";
import { BuildCrate } from "./commands.ts";

const buildStage = Image.from("rust:1.63")
  .run("rustup component add clippy")
  .run("rustup component add rustfmt")
  .workDir("/usr/src")
  // Build project.
  .with(BuildCrate("ruff"))
  // Copy over auxiliary resources.
  .copy("ruff/resources", "resources")
  .copy("ruff/pyproject.toml", "pyproject.toml");

export { buildStage };
