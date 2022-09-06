import { Image } from "./image.js";

/**
 * Perform a pre-order traversal.
 */
function preorderTraversal(root: Image): Image[] {
  const stack: Image[] = [root];
  const traversed: Image[] = [];

  let current;
  while (stack.length) {
    current = stack.pop();
    traversed.push(current);
    stack.push(...current.dependencies);
  }

  return traversed;
}

export function solve(root: Image): string {
  const images = preorderTraversal(root).reverse();
  return [
    "#syntax=docker/dockerfile:1.4",
    ...images.map((image) => image.codegen()),
  ].join("\n\n");
}
