import { Command, Env, Run } from "../../../trellis/index.ts";

export class InstallRustToolchain extends Command {
  constructor(version: string) {
    super([
      new Env({
        CARGO_HOME: "/",
        RUSTUP_HOME: "/",
      }),
      new Run(
        `curl https://sh.rustup.rs -sSf | sh -s -- -y --default-toolchain ${version}`,
      ),
    ]);
  }
}

export class Cargo extends Command {
  constructor(command: string) {
    super([
      new Run(`cargo ${command}`, [
        {
          type: "cache",
          target: "/.cargo/registry",
          sharing: "locked",
        },
      ]),
    ]);
  }
}
