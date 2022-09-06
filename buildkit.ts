import { DockerImage } from "./image";

export function solve(images: DockerImage[]): string {
  const resolved: { [K: string]: DockerImage } = {};
  for (const image of images) {
    for (const dependency of image.dependencies) {
      resolved[dependency.name] = dependency;
    }
    resolved[image.name] = image;
  }

  return [
    "#syntax=docker/dockerfile:experimental",
    ...Object.values(resolved).map((image) => image.codegen()),
  ].join("\n\n");
}
