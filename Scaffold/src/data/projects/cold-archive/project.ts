import type { Project } from "../types";
//THIS IS AN EXAMPLE OF A TEXT PROJECT,CLONE THIS FILE AND MODIFY THE CONTENT TO CREATE A NEW TEXT PROJECT
const project: Project = {
  id: "cold-archive",
  title: "Cold Archive",
  type: "media",

  tags: ["Fashion"],
  description: ` 
 Cold Archive is a UK-based creative agency specializing in viral subcultural content creation. They achieve this through a flywheel effect, leveraging archival content like original magazine scans and curated 'lost media' alongside their community of users to generate content that inspires future creation. Once a content type has proven its viral potential, they partner with suitable brands to merge products with viral content angles across a wide range of marketing contexts, from in-person experiential events to social media campaigns.

I became involved with Cold Archive around 2022 when they reached out due to my work with My Clothing Archive, inviting me to write for them. Since then, I've produced dozens of viral social media content pieces and ghostwritten nearly all of their media content, from exhibition text to branded collaborations to guest pieces in i-D and Hypebeast.

The work spans cultural documentation of youth subcultures, streetwear history, and music scenes, transforming archival research into engaging narratives that resonate with contemporary audiences.

I have provided a selection of standout social media work in the media gallery. 

Browse the links below for full text examples and the site project gallery for additional collaborative work.
`,
  credits: [
    { role: "URL", name: "[Cold Archive](https://www.instagram.com/cold_archive/)" }
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
  ],

  body: `
 [Captivating The 'Birds Eye View' Perspective through Photography](https://www.instagram.com/p/Cla-urhS-jL/?img_index=1)

[The radicalization of 'beauty'](https://www.instagram.com/p/DOt6YcQjHAM/?img_index=10)

[Understanding Liam & Noel's Style Evolution Through Rare Scans and Interviews](https://www.instagram.com/p/DNYNSPtNeBY/?img_index=3)

[The Effect of "Branding" on Streetwear](https://www.instagram.com/p/DQNIQnXDJ68/?img_index=1)

[The Effect of "Branding" on Streetwear Part 2](https://www.instagram.com/p/DLFTQJKNbU8/?img_index=1)

[How Bad Taste Became Good - Tribal Tattoos](https://www.instagram.com/p/DDFCQgLNYBg/?img_index=7)

[The Style of No Style](https://www.instagram.com/p/DGiOmkRtsk8/?img_index=1)

[The Forgotten Era of 'The Flickr Days'](https://www.instagram.com/p/C0KnCFkNqYZ/?img_index=1)
`
};

export default project;