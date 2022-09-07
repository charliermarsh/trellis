import { Codegen } from "./codegen.js";
import { Image } from "./image.js";
import { Entrypoint } from "./instructions.js";

export class Task implements Codegen {
  instruction: string[];
  image: Image;

  constructor(instruction: string[], image: Image) {
    this.instruction = instruction;
    this.image = image;
  }

  codegen(): string {
    return [
      `FROM ${this.image.name}`,
      new Entrypoint(this.instruction).codegen(),
    ].join("\n");
  }
}
