import type { Project } from "../types";
//THIS IS AN EXAMPLE OF A TEXT PROJECT,CLONE THIS FILE AND MODIFY THE CONTENT TO CREATE A NEW TEXT PROJECT
const project: Project = {
  id: "vision-otf",
  title: "Vision of the Future",
  type: "media",

  tags: ["Personal"],
  description: ` Vision of the Future was my thesis project, completed in fulfillment of the requirements for my B.Des at Toronto Metropolitan University. The project explores the ongoing homogeneity of design across the world and, through various visual and text interventions, proposes methods of combatting it.

Additionally, a “codex” was produced to elucidate the project’s conceptual framework and approach.

The entire project is available to view in full at the URL on the right.
   `,
   credits: [
    { role: "Author", name: "Joseph Gleasure" },
    { role: "URL", name: "[Vision of the Future](https://medium.com/tensorlake-ai/announcing-indexify-a36f69967884)" }
  ],

  media: [
    new URL("./1 (1).jpg", import.meta.url).href,
    new URL("./1 (2).jpg", import.meta.url).href,
    new URL("./1 (3).jpg", import.meta.url).href,
    new URL("./1 (4).jpg", import.meta.url).href,
    new URL("./1 (5).jpg", import.meta.url).href,
    new URL("./1 (6).jpg", import.meta.url).href,
    new URL("./1 (7).jpg", import.meta.url).href,
    new URL("./1 (8).jpg", import.meta.url).href,
    new URL("./1 (9).jpg", import.meta.url).href,
    new URL("./1 (10).jpg", import.meta.url).href,
    new URL("./1 (11).jpg", import.meta.url).href,
    new URL("./1 (12).jpg", import.meta.url).href,
    new URL("./1 (13).jpg", import.meta.url).href,
    new URL("./1 (14).jpg", import.meta.url).href,
    new URL("./1 (15).jpg", import.meta.url).href,
    new URL("./1 (16).jpg", import.meta.url).href,
    new URL("./1 (17).jpg", import.meta.url).href,
    new URL("./1 (18).jpg", import.meta.url).href,
    new URL("./1 (19).jpg", import.meta.url).href,
    new URL("./1 (20).jpg", import.meta.url).href,
    new URL("./1 (21).jpg", import.meta.url).href,
  ],
};

export default project;