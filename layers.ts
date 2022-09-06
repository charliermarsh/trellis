import { Codegen, Env, Run } from "./image";

export class InstallRustToolchain implements Codegen {
  version: string;

  constructor(version: string) {
    this.version = version;
  }

  codegen(): string {
    return [
      new Run(
        `curl https://sh.rustup.rs -sSf | sh -s -- -y --default-toolchain ${this.version}`
      ),
      // TODO(charlie): Each layer might need access to the current directory.
      new Env({ PATH: "$PATH:/root/.cargo/bin" }),
    ]
      .map((layer) => layer.codegen())
      .join("\n");
  }
}

export class RunCargo implements Codegen {
  subCommand: string;

  constructor(subCommand: string) {
    this.subCommand = subCommand;
  }

  codegen(): string {
    return `RUN --mount=type=cache,sharing=locked,target=/root/.cargo/registry cargo ${this.subCommand}`;
  }
}
