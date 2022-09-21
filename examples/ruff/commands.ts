import { Command, Copy, Run } from "../../trellis/mod.ts";

export class BuildCargoProject extends Command {
  constructor(directory: string) {
    super([
      // Build dependencies.
      new Copy(`${directory}/Cargo.toml`, "."),
      new Copy(`${directory}/Cargo.lock`, "."),
      new Run("mkdir -p src && touch src/lib.rs"),
      new Run("cargo build", [
        {
          type: "cache",
          target: "/usr/local/cargo/registry",
        },
      ]),
      // Build user code.
      new Copy(`${directory}/src`, "src"),
      new Run("mkdir -p src && touch src/lib.rs"),
      new Run("cargo build", [
        {
          type: "cache",
          target: "/usr/local/cargo/registry",
        },
      ]),
    ]);
  }
}
