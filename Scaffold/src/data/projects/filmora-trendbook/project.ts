import type { Project } from "../types";
//THIS IS AN EXAMPLE OF A TEXT PROJECT,CLONE THIS FILE AND MODIFY THE CONTENT TO CREATE A NEW TEXT PROJECT
const project: Project = {
  id: "filmora-trendbook",
  title: "Filmora Trendbook",
  type: "media",

  tags: ["AI", "Branding"],
  description: ` 

I worked at Wondershare, a Chinese creative SaaS company comparable to Adobe, first as a Copywriter and later as a Content Marketing Specialist. My most impactful project there was **Trendbook**, a digital publication and branding campaign covering emerging design trends. Trendbook later became a primary marketing channel for **Filmora’s Creative Resource Center** (the team behind Filmora’s video effects and creative assets, similar in function to Adobe Stock).

I initially joined as **Content Lead for Issue 4**, which later evolved into **Aitopia**. Drawing on my background in design history and trend research, I proposed leaning into the early “weirdness” of AI image generation and extending Dezeen’s *Aitopia* series into a concept tailored to Wondershare’s audience and creative goals.

Shortly after launch, I was asked to take full ownership of the campaign, leading it end-to-end across **art direction**, **editorial strategy**, and **project management**. I remained in this role through **Summer 2024**.

Over three issues, I led Trendbook through distinct themes including **AI**, **Y2K**, and **Gringe**, translating experimental visual culture into cohesive storytelling for an audience of **millions**. I also navigated and ultimately overcame internal resistance, advocating for more forward-looking creative direction and establishing Trendbook as a platform for cutting-edge design content.

*Gallery images and supporting content were contributed by designers including Megan Kim, Luiza Gondim, and Victoria Falco.*
` ,

  credits: [
    { role: "CD", name: "Joseph Gleasure" },
    { role: "Client", name: "Wondershare Filmora" },
    { role: "URL", name: "[Aitopia](https://filmora.wondershare.com/trendbook/aitopia-dreamer.html)" },
    { role: "URL", name: "[Neu Grunge](https://filmora.wondershare.com/trendbook/neu-grunge.html)" },
    { role: "URL", name: "[Y2K](https://filmora.wondershare.com/trendbook/y2k.html)" }
  ],
  media: [
    new URL("./1 (1).jpg", import.meta.url).href,
    new URL("./1 (2).jpg", import.meta.url).href,
    new URL("./1 (3).jpg", import.meta.url).href,
    new URL("./1 (1).mp4", import.meta.url).href,
    new URL("./1 (2).mp4", import.meta.url).href,
  ],

};

export default project;