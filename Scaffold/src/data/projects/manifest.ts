import type { ProjectMeta } from "./types";

/** Lightweight homepage/nav data — no media or long copy (keeps entry JS small). */
export const projectsMeta: ProjectMeta[] = [
  { id: "vision-tools", title: "Vision Tools", type: "media", tags: ["Fashion", "Branding"] },
  { id: "losing-my-hands", title: "Losing My Hands", type: "text", tags: ["AI"] },
  {
    id: "hiring-mles",
    title: "Hiring MLEs at Early Stage Companies",
    type: "text",
    tags: ["AI"],
  },
  {
    id: "year-of-LLMs",
    title: "What We Learned from a Year of Building with LLMs",
    type: "text",
    tags: ["AI"],
  },
  {
    id: "data-flywheels",
    title: "Data Flywheel Go Brrr: Using Your Users to Build Better Products",
    type: "text",
    tags: ["AI"],
  },
  { id: "needs-evals", title: "Your AI Product Needs Evals", type: "text", tags: ["AI"] },
  {
    id: "levis-icd",
    title: "An Expanded History of Levi's ICD+ & Philips' Wearable Electronics Program",
    type: "text",
    tags: ["Fashion"],
  },
  { id: "announcing-Indexify", title: "Announcing Indexify", type: "text", tags: ["AI"] },
  {
    id: "cold-stranger-things",
    title: "Did Stranger Things Help Nerds Win the Culture War?",
    type: "media",
    tags: ["Fashion"],
  },
  { id: "cold-archive", title: "Cold Archive", type: "media", tags: ["Fashion"] },
  { id: "cold-puma", title: "Cold Archive x PUMA", type: "media", tags: ["Fashion"] },
  {
    id: "cpcompany-50th",
    title: "C.P. Company 50th Anniversary",
    type: "media",
    tags: ["Fashion"],
  },
  {
    id: "wondershare-filmora",
    title: "Wondershare Filmora",
    type: "media",
    tags: ["AI", "Branding"],
  },
  {
    id: "filmora-trendbook",
    title: "Filmora Trendbook",
    type: "media",
    tags: ["AI", "Branding"],
  },
  {
    id: "my-clothing-archive",
    title: "My Clothing Archive",
    type: "media",
    tags: ["Fashion", "Personal"],
  },
  { id: "vision-otf", title: "Vision of the Future", type: "media", tags: ["Personal"] },
  {
    id: "archive-process",
    title: "Archive Process",
    type: "media",
    tags: ["Fashion", "Personal"],
  },
  {
    id: "shellzine-shenzhen",
    title: "The Crowded Desert: Architecture and Urbanism in Shenzhen",
    type: "media",
    tags: ["Personal"],
  },
  { id: "intel-from-seoul", title: "Intel from Seoul", type: "media", tags: ["Fashion"] },
];

export function findProjectMetaById(id: string) {
  return projectsMeta.find((p) => p.id === id);
}
