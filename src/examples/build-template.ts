import { buildTemplate } from "@gitwit/sandbox";

const templateDir = "./template"
const templateName = "gitwit-desktop"

await buildTemplate(
    "e2b", templateDir, templateName, { cpuCount: 2, memoryMB: 1024 }
)

await buildTemplate(
    "daytona", templateDir, templateName, { cpu: 2, memory: 2, disk: 2, gpu: 1 }
)