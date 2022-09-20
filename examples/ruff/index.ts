import { Image } from "../../trellis/index.ts";

const buildStage = Image.from("rust:1.63")
  .workDir("/usr/src/ruff")
  // Build dependencies.
  .copy("ruff/Cargo.toml", ".")
  .copy("ruff/Cargo.lock", ".")
  .run("mkdir -p src && touch src/lib.rs")
  .run("cargo build")
  // Build user code.
  .copy("ruff/src", "src")
  .run("mkdir -p src && touch src/lib.rs")
  .run("cargo build")
  // Copy over auxiliary resources.
  .copy("ruff/resources", "resources")
  .copy("ruff/pyproject.toml", "pyproject.toml");

const devStage = Image.from(buildStage)
  .run("rustup component add clippy")
  .run("rustup component add rustfmt");

export { buildStage, devStage };
