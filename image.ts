import crypto from "crypto";

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
  from?: DockerImage;

  constructor(source: string, destination: string, from?: DockerImage) {
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

export class DockerImage implements Codegen {
  name: string;
  source: string;
  layers: Codegen[];
  dependencies: DockerImage[];

  constructor(
    name: string,
    source: string,
    layers: Codegen[],
    dependencies: DockerImage[]
  ) {
    this.name = name;
    this.source = source;
    this.layers = layers;
    this.dependencies = dependencies;
  }

  static from(source: string): DockerImage {
    return new DockerImage("stage-" + crypto.randomUUID(), source, [], []);
  }

  customLayer(layer: Codegen): DockerImage {
    return new DockerImage(
      this.name,
      this.source,
      [...this.layers, layer],
      this.dependencies
    );
  }

  aptInstall(dependencies: string[]): DockerImage {
    return new DockerImage(
      this.name,
      this.source,
      [...this.layers, new AptInstall(dependencies)],
      this.dependencies
    );
  }

  workDir(dirName: string): DockerImage {
    return new DockerImage(
      this.name,
      this.source,
      [...this.layers, new WorkDir(dirName)],
      this.dependencies
    );
  }

  run(sh: string): DockerImage {
    return new DockerImage(
      this.name,
      this.source,
      [...this.layers, new Run(sh)],
      this.dependencies
    );
  }

  cmd(instruction: string | string[]): DockerImage {
    return new DockerImage(
      this.name,
      this.source,
      [...this.layers, new Cmd(instruction)],
      this.dependencies
    );
  }

  copy(source: string, destination: string): DockerImage {
    return new DockerImage(
      this.name,
      this.source,
      [...this.layers, new Copy(source, destination)],
      this.dependencies
    );
  }

  expose(port: number): DockerImage {
    return new DockerImage(
      this.name,
      this.source,
      [...this.layers, new Expose(port)],
      this.dependencies
    );
  }

  env(vars: EnvVars): DockerImage {
    return new DockerImage(
      this.name,
      this.source,
      [...this.layers, new Env(vars)],
      this.dependencies
    );
  }

  codegen(): string {
    return [
      `FROM ${this.source} AS ${this.name}`,
      ...this.layers.map((layer) => layer.codegen()),
    ].join("\n");
  }

  saveArtifact(fileName: string): Artifact {
    return new Artifact(this, fileName);
  }

  copyArtifact(artifact: Artifact, destination: string): DockerImage {
    return new DockerImage(
      this.name,
      this.source,
      [
        ...this.layers,
        new Copy(artifact.fileName, destination, artifact.source),
      ],
      [...this.dependencies, artifact.source]
    );
  }
}

export class Artifact {
  source: DockerImage;
  fileName: string;

  constructor(source: DockerImage, fileName: string) {
    this.source = source;
    this.fileName = fileName;
  }
}
