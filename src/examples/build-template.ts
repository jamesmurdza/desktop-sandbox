import { buildTemplate } from "@gitwit/sandbox";

const templateDir = "./template"
const templateName = "gitwit-desktop"

await buildTemplate(
    "e2b", templateDir, templateName, { cpuCount: 8, memoryMB: 8192 },
)

await buildTemplate(
    "daytona", templateDir, templateName, { cpu: 4, memory: 8, disk: 8, gpu: 1 }
)