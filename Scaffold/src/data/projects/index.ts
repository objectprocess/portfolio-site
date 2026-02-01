import visionTools from "./vision-tools/project";
import losingMyHands from "./losing-my-hands/project";
import hiringMLEs from "./hiring-MLEs/project";
import yearOfLLMs from "./year-of-LLMs/project";
import dataFlywheels from "./data-flywheels/project";
import needsEvals from "./needs-evals/project";
import levisICD from "./levis-icd/project";
import announcingIndexify from "./announcing-Indexify/project";
import coldStrangerThings from "./cold-stranger-things/project";
import coldArchive from "./cold-archive/project";
import coldPuma from "./cold-puma/project";
import cpcompany from "./cpcompany-50th/project";
import wondershareFilmora from "./wondershare-filmora/project";
import filmoraTrendbook from "./filmora-trendbook/project";
import myClothingArchive from "./my-clothing-archive/project";
import visionOTF from "./vision-otf/project";
import archiveProcess from "./archive-process/project";
import shenzhen from "./shellzine-shenzhen/project";
import intelKR from "./intel-from-seoul/project";




export const projects = [
  visionTools,
  losingMyHands,
  hiringMLEs,
  yearOfLLMs,
  dataFlywheels,
  needsEvals,
  levisICD,
  announcingIndexify,
  coldStrangerThings,
  coldArchive,
  coldPuma,
  cpcompany,
  wondershareFilmora,
  filmoraTrendbook,
  myClothingArchive,
  visionOTF,
  archiveProcess,
  shenzhen,
  intelKR,
];

export const findProjectById = (id: string) =>
  projects.find((p) => p.id === id);
