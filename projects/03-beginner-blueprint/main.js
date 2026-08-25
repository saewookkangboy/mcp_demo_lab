import { createMockMcpClient } from "../../shared/mcp/mock-mcp-client.js";
import { createMcpInspector, renderDemoError, renderTrace } from "../../shared/ui/mcp-inspector.js";
import { mountOssExtension } from "../../shared/ui/oss-extension.js";
import { createHarnessController } from "../../shared/ui/harness-controller.js";
import { createBlueprintServer } from "./src/server.js";

export async function generateFloorPlan(input, onTrace) {
  const client = createMockMcpClient(createBlueprintServer(), { onTrace });
  await client.connect();
  await client.listTools();
  return client.callTool("generate_floor_plan", input);
}

const document = globalThis.document ?? { querySelector: () => null };
const form = document.querySelector("form");
const result = document.querySelector("#result");
const inspector = createMcpInspector({
  anchor: form,
  onReset: () => { form.reset(); result.hidden = true; result.classList.remove("is-error"); }
});
const harness = createHarnessController({ anchor:form, project:"blueprint", required:["width","height","purpose"], allowedTools:["generate_floor_plan"] });
mountOssExtension("blueprint");

if (form) form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const fields = new FormData(form);
  result.classList.remove("is-error");
  try {
    const input = { width:Number(fields.get("width")), height:Number(fields.get("height")), purpose:fields.get("purpose") };
    const run = await harness.run({ input, toolName:"generate_floor_plan", execute:()=>generateFloorPlan(input, inspector?.record), verify:(data)=>({ ok:data.area===input.width*input.height&&data.svg.includes("<svg"), message:"면적 계산과 SVG 산출물 계약 통과", metrics:{area:data.area,deskCount:data.deskCount} }) });
    const data = run.value;
    result.hidden = false;
    result.innerHTML = `<p class="status">blueprint-mcp · generate_floor_plan</p><h2>${data.purpose} 가상 설계도</h2>${data.svg}<div class="grid"><div class="card">면적<br><strong>${data.area}㎡</strong></div><div class="card">권장 좌석<br><strong>${data.deskCount}개</strong></div><div class="card">축척<br><strong>${data.scale}</strong></div></div>${data.warnings.map((item) => `<p>⚠ ${item}</p>`).join("")}`;
    harness.decorateResult(result, run.meta);
    renderTrace(inspector, "SVG 설계도 렌더링 완료", { area: data.area, deskCount: data.deskCount, warningCount: data.warnings.length });
  } catch (error) {
    renderDemoError(result, error);
  }
});
