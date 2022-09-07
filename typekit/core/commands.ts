import { Codegen } from "./codegen.ts";
import { Env, Run } from "./instructions.ts";

class Command implements Codegen {
  instructions: Codegen[];

  constructor(instructions: Codegen[]) {
    this.instructions = instructions;
  }

  codegen(): string {
    return this.instructions.map((layer) => layer.codegen()).join("\n");
  }
}

export class InstallRustToolchain extends Command {
  constructor(version: string) {
    super([
      new Run(
        `curl https://sh.rustup.rs -sSf | sh -s -- -y --default-toolchain ${version}`,
      ),
      // TODO(charlie): Each layer might need access to the current directory? We use /root here.
      new Env({ PATH: "$PATH:/root/.cargo/bin" }),
    ]);
  }
}

export class RunCargo extends Command {
  constructor(command: string) {
    super([
      new Run(`cargo ${command}`, [
        {
          type: "cache",
          target: "/root/.cargo/registry",
          sharing: "locked",
        },
      ]),
    ]);
  }
}

export class AptInstall extends Command {
  constructor(dependencies: string[]) {
    super([
      new Run(
        `apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends ${
          dependencies
            .sort()
            .join(" ")
        }`,
        [
          {
            type: "cache",
            target: "/var/cache/apt",
            sharing: "locked",
          },
          {
            type: "cache",
            target: "/var/lib/apt",
            sharing: "locked",
          },
        ],
      ),
    ]);
  }
}
