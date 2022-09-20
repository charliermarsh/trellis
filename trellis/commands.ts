import { Codegen } from "./codegen.ts";
import { Run } from "./instructions.ts";

export class Command implements Codegen {
  instructions: Codegen[];

  constructor(instructions: Codegen[]) {
    this.instructions = instructions;
  }

  codegen(): string {
    return this.instructions.map((layer) => layer.codegen()).join("\n");
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
