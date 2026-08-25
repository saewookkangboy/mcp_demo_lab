import { readdir, access } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const projects = (await readdir(join(root,"projects"), { withFileTypes:true })).filter((x)=>x.isDirectory());
if (projects.length !== 5) throw new Error(`프로젝트 수 오류: ${projects.length}`);
await access(join(root,"shared/ui/mcp-inspector.js"));
await access(join(root,"shared/ui/oss-extension.js"));
await access(join(root,"shared/ui/harness-controller.js"));
await access(join(root,"shared/ui/presentation-studio.js"));
await access(join(root,"shared/harness/execution-harness.js"));
await access(join(root,"shared/server/official-docs-mcp.mjs"));
await access(join(root,"mcp.config.example.json"));
await access(join(root,"docs/HARNESS_COMPARISON_GUIDE.md"));
await access(join(root,"presentation.html"));
for (const project of projects) {
  for (const file of ["README.md","index.html","main.js","src/server.js","tests/app.test.js"]) await access(join(root,"projects",project.name,file));
}
console.log(`smoke ok: ${projects.length} projects, required files present`);
