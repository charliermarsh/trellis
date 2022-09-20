/**
 * Dockerfile instructions.
 *
 * See: https://docs.docker.com/engine/reference/builder.
 */
import { Codegen } from "./codegen.ts";
import { Image } from "./image.ts";
import { Mount, serialize } from "./mount.ts";
import { EnvVars } from "./types.ts";

interface Instruction extends Codegen {}

export class Run implements Instruction {
  sh: string;
  mount?: Mount[];

  constructor(sh: string, mount?: Mount[]) {
    this.sh = sh;
    this.mount = mount;
  }

  codegen(): string {
    return this.mount == null ? `RUN ${this.sh}` : `RUN ${
      this.mount
        .map(serialize)
        .map((mount) => `--mount=${mount}`)
        .join(" ")
    } ${this.sh}`;
  }
}

export class Cmd implements Instruction {
  instruction: string | string[];

  constructor(instruction: string | string[]) {
    this.instruction = instruction;
  }

  codegen(): string {
    return typeof this.instruction === "string"
      ? `CMD ${this.instruction}`
      : `CMD ${JSON.stringify(this.instruction)}`;
  }
}

export class Label implements Instruction {
  vars: EnvVars;

  constructor(vars: EnvVars) {
    this.vars = vars;
  }

  codegen(): string {
    return `LABEL ${
      Object.entries(this.vars)
        .map(([key, value]) => `"${key}"="${value}"`)
        .join(" ")
    }`;
  }
}

export class Expose implements Instruction {
  port: number;

  constructor(port: number) {
    this.port = port;
  }

  codegen(): string {
    return `EXPOSE ${this.port}`;
  }
}

export class Env implements Instruction {
  vars: EnvVars;

  constructor(vars: EnvVars) {
    this.vars = vars;
  }

  codegen(): string {
    return Object.entries(this.vars)
      .sort()
      .map(([key, value]) => `ENV ${key} ${value}`)
      .join("\n");
  }
}

export class Copy implements Instruction {
  source: string;
  destination: string;
  chown?: { user: string; group: string };
  from?: Image;

  constructor(
    source: string,
    destination: string,
    chown?: { user: string; group: string },
    from?: Image,
  ) {
    this.source = source;
    this.destination = destination;
    this.chown = chown;
    this.from = from;
  }

  codegen(): string {
    const segments = ["COPY", "--link"];
    if (this.chown) {
      segments.push(`--chown=${this.chown.user}:${this.chown.group}`);
    }
    if (this.from) {
      segments.push(`--from=${this.from.name}`);
    }
    segments.push(this.source);
    segments.push(this.destination);
    return segments.join(" ");
  }
}

export class Entrypoint implements Instruction {
  instruction: string | string[];

  constructor(instruction: string | string[]) {
    this.instruction = instruction;
  }

  codegen(): string {
    return typeof this.instruction === "string"
      ? `ENTRYPOINT ${this.instruction}`
      : `ENTRYPOINT ${JSON.stringify(this.instruction)}`;
  }
}

export class Volume implements Instruction {
  instruction: string | string[];

  constructor(instruction: string | string[]) {
    this.instruction = instruction;
  }

  codegen(): string {
    return typeof this.instruction === "string"
      ? `VOLUME ${this.instruction}`
      : `VOLUME ${JSON.stringify(this.instruction)}`;
  }
}

export class User implements Instruction {
  name: string;
  group?: string;

  constructor(name: string, group?: string) {
    this.name = name;
    this.group = group;
  }

  codegen(): string {
    return this.group == null
      ? `USER ${this.name}`
      : `USER ${this.name}:${this.group}`;
  }
}

export class WorkDir implements Instruction {
  dirName: string;

  constructor(dirName: string) {
    this.dirName = dirName;
  }

  codegen(): string {
    return `WORKDIR ${this.dirName}`;
  }
}

export class Arg implements Instruction {
  name: string;
  defaultValue?: string | number;

  constructor(name: string, defaultValue?: string | number) {
    this.name = name;
    this.defaultValue = defaultValue;
  }

  codegen(): string {
    return this.defaultValue == null
      ? `ARG ${this.name}`
      : `ARG ${this.name}="${this.defaultValue}"`;
  }
}

export class Shell implements Instruction {
  instruction: string[];

  constructor(instruction: string[]) {
    this.instruction = instruction;
  }

  codegen(): string {
    return `SHELL ${JSON.stringify(this.instruction)}`;
  }
}
