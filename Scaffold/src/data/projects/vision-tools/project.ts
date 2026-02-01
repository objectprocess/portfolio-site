import type { Project } from "../types";
//THIS IS AN EXAMPLE OF A MEDIA PROJECT,CLONE THIS FILE AND MODIFY THE CONTENT TO CREATE A NEW MEDIA PROJECT
const fallback = new URL("../../../assets/projects/fallback.jpg", import.meta.url).href;
const project: Project = {
  id: "vision-tools",
  title: "Vision Tools",
  type: "media",

  tags: ["Fashion", "Branding"],
  description: `Vision Tools is an independent eyewear ecosystem created by designer [TOMBOGO](https://hypebeast.com/2025/9/tombogo-community-lookbook-fw25-fall-winter-2025-collection-release-info) and realized in collaboration with Vooglam. Positioning eyewear as functional equipment rather than mere accessories, Vision Tools merges technological innovation with organic textures to create optical solutions that fundamentally reimagine how wearers engage with their environment. 
  
  The inaugural collection, Hypothesis, debuted at New York Fashion Week Fall 2025 as a series of experimental interventions where everyday tools meet eyewear design. Individual frames incorporate USB storage drives, compasses, geological formations, and other utilitarian elements, blurring the boundary between tool and accessory. Each piece functions as both optical equipment and tangible hypothesis about form meeting function.  The collection garnered substantial press coverage in [Fucking Young](https://fuckingyoung.es/vooglam-and-tombogos-first-eyewear-collaboration/) and [Hypebeast](https://hypebeast.com/2025/9/tombogo-community-lookbook-fw25-fall-winter-2025-collection-release-info) following its commercial launch.
  
  As Content Direction Lead, I worked with Vooglam's design team to establish content guidelines and asset production standards while providing critical input on final product assortment and campaign direction. I oversaw packaging design, web assets, and landing page development, and coordinated with our partnerships manager and external PR agency [No Such Agency](https://www.nsa-international.com/) to produce media content.
`,
  credits: [
    { role: "Content", name: "Joseph Gleasure" },
    { role: "Client", name: "TOMBOGO, Vooglam" },
    { role: "PR", name: "No Such Agency" },
    { role: "URL", name: "[Vision Tools](https://www.vooglam.com/vooglam-tombogo-collection)" }
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
  ]
};

export default project;