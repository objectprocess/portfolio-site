import type { Project } from "../types";
const project: Project = {
  id: "wondershare-filmora",
  title: "Wondershare Filmora",
  type: "media",

  tags: ["AI", "Branding"],
  description: ` I was a copywriter for Wondershare mainly focusing on their flagship product Filmora. 
  
  I worked extensively on versions 13 and 14  as the lead copywriter for the product and website across two major version updates.
  
  I worked with the GTM, Product and Marketing teams to ensure a consistent brand voice, and exceptional user experience in both the product and on the website. 

  Gallery images and supporting content were produced by Ayeong Kim & Megan Kim.
`,
  credits: [
    { role: "Author", name: "Joseph Gleasure" },
    { role: "Client", name: "Wondershare" },
    { role: "URL", name: "[Wondershare Filmora](https://filmora.wondershare.com)" }
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
  ],
  
};

export default project;