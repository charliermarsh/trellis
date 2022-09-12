import toposort from "toposort";
import { Image } from "./image.js";

function preorderTraversal(root: Image): Image[] {
  const stack: Image[] = [root];
  const traversed: Image[] = [];
  const seen: Set<string> = new Set();

  let current;
  while (stack.length) {
    current = stack.pop();
    if (seen.has(current.name)) {
      continue;
    }
    seen.add(current.name);
    traversed.push(current);
    stack.push(...current.dependencies);
  }

  return traversed;
}

function topologicalSort(images: Image[]): Image[] {
  const imageByName = {};
  const edges = [];
  for (const image of images) {
    imageByName[image.name] = image;
    for (const dependency of image.dependencies) {
      edges.push([dependency.name, image.name]);
    }
  }

  const sorted = toposort(edges).map((imageName) => imageByName[imageName]);
  const excluded = [];
  for (const image of images) {
    if (!sorted.includes(image)) {
      excluded.push(image);
    }
  }
  return [...excluded, ...sorted];
}

export function solve(root: Image): string {
  const images = topologicalSort(preorderTraversal(root));

  return [
    "#syntax=docker/dockerfile:1.4",
    ...images.map((image) => image.codegen()),
  ].join("\n\n");
}
