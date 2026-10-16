export type ProjectType = "media" | "text";

export const TAGS = ["AI", "Fashion", "Branding", "Personal"] as const;
export type Tag = (typeof TAGS)[number];

export type ProjectCredit = {
  role: string; // role performed
  name: string; // person or org name
};

/** Homepage / nav fields only — safe to ship in the initial bundle. */
export type ProjectMeta = {
  id: string;
  title: string;
  type: ProjectType;
  tags: Tag[];
};

export type Project = ProjectMeta & {
  // short summary, always present
  description: string;

  credits?: ProjectCredit[];

  // content differs by type
  body?: string; // ONLY for text projects
  media?: string[]; // ONLY for media projects
};
