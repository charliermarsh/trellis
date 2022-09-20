import { Command, Copy, Run } from "../../trellis/index.ts";

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
          target: "/.cargo/registry",
          sharing: "locked",
        },
      ]),
      // Build user code.
      new Copy(`${directory}/src`, "src"),
      new Run("mkdir -p src && touch src/lib.rs"),
      new Run("cargo build", [
        {
          type: "cache",
          target: "/.cargo/registry",
          sharing: "locked",
        },
      ]),
    ]);
  }
}
