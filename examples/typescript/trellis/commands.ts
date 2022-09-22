import { Run } from "../../../trellis/mod.ts";

export function npm(subCommand: string) {
  return [
    new Run(`npm set cache /.cache/npm && npm ${subCommand}`, [
      {
        type: "cache",
        target: "/.cache/npm",
      },
    ]),
  ];
}
