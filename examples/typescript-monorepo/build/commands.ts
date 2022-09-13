import { Command, Run } from "../../../typekit/index.ts";

export class NPM extends Command {
  constructor(command: string) {
    super([
      new Run(`npm set cache /root/.cache/npm && npm ${command}`, [
        {
          type: "cache",
          target: "/root/.cache/npm",
        },
      ]),
    ]);
  }
}
