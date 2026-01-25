export type ProjectType = "media" | "text";

export const TAGS = ["AI", "Fashion", "Branding", "Personal"] as const;
export type Tag = (typeof TAGS)[number];

export type ProjectCredit = {
  role: string; // role performed
  name: string; // person or org name
};

export type Project = {
  id: string;
  title: string;
  type: ProjectType;

  //thumbnail: string;

  // controlled buckets for filtering
  tags: Tag[];

  // short summary, always present
  description: string;

  credits?: ProjectCredit[];

  // content differs by type
  body?: string;     // ONLY for text projects
  media?: string[];  // ONLY for media projects
};
