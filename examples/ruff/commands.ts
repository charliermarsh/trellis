import { Copy, id, Run } from "../../trellis/mod.ts";

export function Cargo(subCommand: string) {
  return [
    new Run(`cargo ${subCommand}`, [
      {
        type: "cache",
        target: "/usr/local/cargo/registry",
        id: id("/usr/local/cargo/registry"),
      },
      {
        type: "cache",
        target: "/usr/local/cargo/git",
        id: id("/usr/local/cargo/git"),
      },
      {
        type: "cache",
        target: "target",
        id: id("target"),
      },
    ]),
  ];
}

export function BuildCrate(directory: string) {
  return [
    // Build dependencies.
    new Copy(`${directory}/Cargo.toml`, "."),
    new Copy(`${directory}/Cargo.lock`, "."),
    new Run("mkdir -p src && touch src/lib.rs"),
    ...Cargo("build"),
    // Build user code.
    new Copy(`${directory}/src`, "src"),
    new Run("mkdir -p src && touch src/lib.rs"),
    ...Cargo("build"),
  ];
}
