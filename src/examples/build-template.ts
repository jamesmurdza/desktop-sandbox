import { buildTemplate } from "@gitwit/sandbox";


await buildTemplate(
    "e2b", 
    "/mnt/f/Github/sandboxjs/template", 
    "gitwit-desktop", 
    { cpuCount: 2, memoryMB: 1024 }
)


await buildTemplate(
    "daytona",
    "/mnt/f/Github/sandboxjs/template",
    "gitwit-desktop",
    { cpu: 2, memory: 2, disk: 2 }
)