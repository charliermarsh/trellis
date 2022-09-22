import { Instruction, Run } from "./instructions.ts";

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
  ];
}
