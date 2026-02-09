import type { Project } from "../types";
//THIS IS AN EXAMPLE OF A TEXT PROJECT,CLONE THIS FILE AND MODIFY THE CONTENT TO CREATE A NEW TEXT PROJECT
const project: Project = {
  id: "my-clothing-archive",
  title: "My Clothing Archive",
  type: "media",

  tags: ["Fashion", "Personal"],
  description: `In 2019, I co-founded My Clothing Archive (MCA) with my partner Etienne Bolduc, an archival fashion platform dedicated to Japanese menswear from the mid-1980s through the early 2000s. Over the next two and a half years, we grew the platform to 30,000+ followers on Instagram and 13,000+ on TikTok.

Through MCA, we collected, sourced, archived, and shared thousands of garments and an extensive library of books and references, gradually piecing together a public history of brands such as Yohji Yamamoto, Comme des Garçons, Issey Miyake, and others. Our goal was to make archival fashion research accessible to a wider audience in a way that had rarely been possible outside of academic or collector circles.

MCA evolved into a multi-platform media brand known for producing the highest quality research and content on Japanese menswear on the English speaking internet. Alongside the editorial platform, we operated a webstore and fulfilled 1,000+ individual sales of archival designer clothing.

For three years, I led nearly everything behind the scenes. My work included:

- Conducting research and building brand history timelines
- Developing identification tools and archival guides
- Writing essays, editorial copy, proposals, and product descriptions
- Developing the social media strategy and content direction
- Sourcing rare archival garments and implementing archival best practices
- Designing the visual identity, including packaging, logomarks, and brand guidelines
- Securing external funding, grants, and institutional support from Toronto Metropolitan University and The Fashion Zone

MCA remains one of the most meaningful projects I’ve built and one of the most formative experiences of my career.

I left MCA in late 2022. As of 2026, Etienne Bolduc continues to operate the webstore and maintains a (comparatively) modest social media presence.`,
 
credits: [
    { role: "Founders", name: "Joseph Gleasure, Etienne Bolduc" },
    { role: "URL", name: "[My Clothing Archive](https://myclothingarchive.net)" },
    { role: "URL", name: "[Instagram](https://www.instagram.com/myclothingarchive/)" }
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
  ],
};

export default project;