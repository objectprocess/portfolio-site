import type { Project } from "../types";
//THIS IS AN EXAMPLE OF A TEXT PROJECT,CLONE THIS FILE AND MODIFY THE CONTENT TO CREATE A NEW TEXT PROJECT
const project: Project = {
  id: "cpcompany-50th",
  title: "C.P. Company 50th Anniversary",
  type: "media",

 
  tags: ["Fashion"],
  description: `For C.P. Company’s Cinquanta (50th anniversary), Cold Archive curated a selection of community contributions. 
  
  I authored the exhibition text and captions featured on the Cinquanta website, telling the story of the brand’s deep connection to youth culture and its role in shaping personal style.
  `,
  credits: [
    { role: "Author", name: "Joseph Gleasure" },
    { role: "Client", name: "Cold Archive, C.P. Company" },
    { role: "URL", name: "[C.P. Company 50th Anniversary](https://archive.cpcompany.com/#U2FsdGVkX19ssn5L82lrJgvh+zruAKv9vHHywK75Se2gbmz4ZDTJDhFACLwiIaM6ge2kmftBpvzQyV9jeTnWPcgCzJI0)" }
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
  ],

  body: `
CURATED BY
Lewis James Dixon

About Cold Archive:

Cold Archive is an interdisciplinary multiplatform resource for visual research. Through this process Cold Archive cultivates a growing self-sustaining international community of like minded creatives that interpret Cold Archive’s work in their own way. Essentially providing stimuli to further aid in the creative process which in turn creates a larger body of work to learn from. Additionally, Cold Archive also creates highly engaging visual content and forward-thinking marketing strategies to brands providing opportunities to include and collaborate with members of the Cold Archive community.

Where Future and Present Collide: Youth Culture’s Obsession with C.P Company

Youth culture tends to gravitate towards authenticity and innovation, the same foundation for Massimo Osti's C.P Company. Inspired by military grade functionality, along with their technically innovative use of fabrics based around their signature garment dyeing techniques, C.P Company has pioneered casual sportswear elevating it to high fashion street style for more than 50 years.
There have been countless versions of this beloved design as it found its way from the Italian racing elite to the streets. It became one of Osti’s most timeless designs, aesthetically bold and functional; the conscious marriage of form and function were appealing to many style and substance-conscious subcultures. Leading to C.P Company being adopted and championed by multiple, diverse communities; from skaters to ravers, from mountain climbers to vintage clothing collectors and more.`
};

export default project;