export type Engine = "docker" | { type: "depot"; project: string };

export function commandFor(engine: Engine): string[] {
  if (engine === "docker") {
    return ["docker", "buildx", "build"];
  } else {
    return [
      "depot",
      "build",
      "--suppress-no-output-warning",
      "--project",
      engine.project,
    ];
  }
}
