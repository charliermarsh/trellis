import { Instruction, Run } from "./instructions.ts";
import { id } from "./mount.ts";

export function aptInstall(dependencies: string[]): Instruction[] {
  return [
    new Run(
      `apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends ${
        dependencies
          .sort()
          .join(" ")
      }`,
      [
        {
          type: "cache",
          sharing: "locked",
          target: "/var/cache/apt",
          id: id("/var/cache/apt"),
        },
        {
          type: "cache",
          sharing: "locked",
          target: "/var/lib/apt",
          id: id("/var/lib/apt"),
        },
      ],
    ),
  ];
}
