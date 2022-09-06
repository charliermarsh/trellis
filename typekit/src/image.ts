import * as crypto from "crypto";

type EnvVars = { [K: string]: string | number };

export interface Codegen {
  codegen(): string;
}

export class AptInstall implements Codegen {
  dependencies: string[];

  constructor(dependencies: string[]) {
    this.dependencies = dependencies;
  }

  codegen(): string {
    return `RUN --mount=type=cache,sharing=locked,target=/var/cache/apt \\
    --mount=type=cache,sharing=locked,target=/var/lib/apt \\
      apt-get update \\
      && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \\
        ${this.dependencies.sort().join(" ")}`;
  }
}

export class Run implements Codegen {
  sh: string;

  constructor(sh: string) {
    this.sh = sh;
  }

  codegen(): string {
    return `RUN ${this.sh}`;
  }
}

export class Cmd implements Codegen {
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

export class WorkDir implements Codegen {
  dirName: string;

  constructor(dirName: string) {
    this.dirName = dirName;
  }

  codegen(): string {
    return `WORKDIR ${this.dirName}`;
  }
}

export class Copy implements Codegen {
  source: string;
  destination: string;
  from?: Image;

  constructor(source: string, destination: string, from?: Image) {
    this.source = source;
    this.destination = destination;
    this.from = from;
  }

  codegen(): string {
    return this.from
      ? `COPY --from=${this.from.name} ${this.source} ${this.destination}`
      : `COPY ${this.source} ${this.destination}`;
  }
}

export class Expose implements Codegen {
  port: number;

  constructor(port: number) {
    this.port = port;
  }

  codegen(): string {
    return `EXPOSE ${this.port}`;
  }
}

export class Env implements Codegen {
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

export class Image implements Codegen {
  name: string;
  source: string;
  layers: Codegen[];
  dependencies: Image[];

  constructor(
    name: string,
    source: string,
    layers: Codegen[],
    dependencies: Image[]
  ) {
    this.name = name;
    this.source = source;
    this.layers = layers;
    this.dependencies = dependencies;
  }

  static from(source: string): Image {
    return new Image("stage-" + crypto.randomUUID(), source, [], []);
  }

  customLayer(layer: Codegen): Image {
    return new Image(
      this.name,
      this.source,
      [...this.layers, layer],
      this.dependencies
    );
  }

  aptInstall(dependencies: string[]): Image {
    return new Image(
      this.name,
      this.source,
      [...this.layers, new AptInstall(dependencies)],
      this.dependencies
    );
  }

  workDir(dirName: string): Image {
    return new Image(
      this.name,
      this.source,
      [...this.layers, new WorkDir(dirName)],
      this.dependencies
    );
  }

  run(sh: string): Image {
    return new Image(
      this.name,
      this.source,
      [...this.layers, new Run(sh)],
      this.dependencies
    );
  }

  cmd(instruction: string | string[]): Image {
    return new Image(
      this.name,
      this.source,
      [...this.layers, new Cmd(instruction)],
      this.dependencies
    );
  }

  copy(source: string, destination: string): Image {
    return new Image(
      this.name,
      this.source,
      [...this.layers, new Copy(source, destination)],
      this.dependencies
    );
  }

  expose(port: number): Image {
    return new Image(
      this.name,
      this.source,
      [...this.layers, new Expose(port)],
      this.dependencies
    );
  }

  env(vars: EnvVars): Image {
    return new Image(
      this.name,
      this.source,
      [...this.layers, new Env(vars)],
      this.dependencies
    );
  }

  saveArtifact(fileName: string): Artifact {
    return new Artifact(this, fileName);
  }

  copyArtifact(artifact: Artifact, destination: string): Image {
    return new Image(
      this.name,
      this.source,
      [
        ...this.layers,
        new Copy(artifact.fileName, destination, artifact.source),
      ],
      [...this.dependencies, artifact.source]
    );
  }

  codegen(): string {
    return [
      `FROM ${this.source} AS ${this.name}`,
      ...this.layers.map((layer) => layer.codegen()),
    ].join("\n");
  }
}

export class Artifact {
  source: Image;
  fileName: string;

  constructor(source: Image, fileName: string) {
    this.source = source;
    this.fileName = fileName;
  }
}
