import { Command, Copy, Run } from "../../trellis/mod.ts";

export class Cargo extends Command {
  constructor(subCommand: string) {
    super(
      new Run(`cargo ${subCommand}`, [
        {
          type: "cache",
          target: "/usr/local/cargo/registry",
        },
        {
          type: "cache",
          target: `/usr/src/app/target`,
        },
      ]),
    );
  }
}

export class BuildCargoProject extends Command {
  constructor(directory: string) {
    super([
      // Build dependencies.
      new Copy(`${directory}/Cargo.toml`, "."),
      new Copy(`${directory}/Cargo.lock`, "."),
      new Run("mkdir -p src && touch src/lib.rs"),
      new Cargo("build"),
      // Build user code.
      new Copy(`${directory}/src`, "src"),
      new Run("mkdir -p src && touch src/lib.rs"),
      new Cargo("build"),
    ]);
  }
}
