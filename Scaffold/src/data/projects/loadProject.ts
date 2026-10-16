import type { Project } from "./types";

const loaders: Record<string, () => Promise<{ default: Project }>> = {
  "vision-tools": () => import("./vision-tools/project"),
  "losing-my-hands": () => import("./losing-my-hands/project"),
  "hiring-mles": () => import("./hiring-MLEs/project"),
  "year-of-LLMs": () => import("./year-of-LLMs/project"),
  "data-flywheels": () => import("./data-flywheels/project"),
  "needs-evals": () => import("./needs-evals/project"),
  "levis-icd": () => import("./levis-icd/project"),
  "announcing-Indexify": () => import("./announcing-Indexify/project"),
  "cold-stranger-things": () => import("./cold-stranger-things/project"),
  "cold-archive": () => import("./cold-archive/project"),
  "cold-puma": () => import("./cold-puma/project"),
  "cpcompany-50th": () => import("./cpcompany-50th/project"),
  "wondershare-filmora": () => import("./wondershare-filmora/project"),
  "filmora-trendbook": () => import("./filmora-trendbook/project"),
  "my-clothing-archive": () => import("./my-clothing-archive/project"),
  "vision-otf": () => import("./vision-otf/project"),
  "archive-process": () => import("./archive-process/project"),
  "shellzine-shenzhen": () => import("./shellzine-shenzhen/project"),
  "intel-from-seoul": () => import("./intel-from-seoul/project"),
};

export async function loadProjectById(id: string): Promise<Project | undefined> {
  const load = loaders[id];
  if (!load) return undefined;
  const mod = await load();
  return mod.default;
}

export function prefetchProject(id: string): void {
  const load = loaders[id];
  if (load) void load();
}
