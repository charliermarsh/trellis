import { DockerImage } from "./image";

/**
 * Perform a pre-order traversal.
 */
function preorderTraversal(root: DockerImage): DockerImage[] {
  const stack: DockerImage[] = [root];
  const traversed: DockerImage[] = [];

  let current;
  while (stack.length) {
    current = stack.pop();
    traversed.push(current);
    stack.push(...current.dependencies);
  }

  return traversed;
}

export function solve(root: DockerImage): string {
  const images = preorderTraversal(root).reverse();
  return [
    "#syntax=docker/dockerfile:experimental",
    ...images.map((image) => image.codegen()),
  ].join("\n\n");
}
