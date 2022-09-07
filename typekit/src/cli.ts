#!/usr/bin/env deno

import { solve } from "./buildkit.js";

const module = await import(`${process.cwd()}/${process.argv[2]}`);
const target = module["build"];

console.log(solve(target));
