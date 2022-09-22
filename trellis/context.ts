import { Engine } from "./engine.ts";

type Context = { engine: Engine };

let GLOBAL_CONTEXT: Context = { engine: "docker" };

export function setContext(context: Partial<Context>) {
  GLOBAL_CONTEXT = { ...GLOBAL_CONTEXT, ...context };
}

export function useContext(): Context {
  return GLOBAL_CONTEXT;
}
