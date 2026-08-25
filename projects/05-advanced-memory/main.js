import { createMockMcpClient } from "../../shared/mcp/mock-mcp-client.js";
import { createMcpInspector, renderDemoError, renderTrace } from "../../shared/ui/mcp-inspector.js";
import { mountOssExtension } from "../../shared/ui/oss-extension.js";
import { createHarnessController } from "../../shared/ui/harness-controller.js";
import { createMemoryServer } from "./src/server.js";

export async function createMemorySession(onTrace) {
  const client = createMockMcpClient(createMemoryServer(), { onTrace });
  await client.connect();
  await client.listTools();
  return {
    remember: (events) => client.callTool("remember_events", { events }),
    recall: (subject) => client.callTool("recall_memory", { subject }),
    timeline: (subject) => client.callTool("inspect_timeline", { subject }),
    listTools: () => client.listTools()
  };
}

const document = globalThis.document ?? { querySelector: () => null };
const form = document.querySelector("form");
const result = document.querySelector("#result");
let session = null;
const inspector = createMcpInspector({
  anchor: form,
  persistent: true,
  testCommand: "node --test projects/05-advanced-memory/tests/app.test.js",
  onReset: () => { session = null; form.reset(); result.hidden = true; result.classList.remove("is-error"); }
});
const harness = createHarnessController({ anchor:form, project:"memory", required:["subject","events"], allowedTools:["remember_events+recall_memory+inspect_timeline"] });
mountOssExtension("memory");

if (form) form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const subject = form.subject.value.trim();
  result.classList.remove("is-error");
  try {
    const events = JSON.parse(form.events.value);
    const input = { subject, events };
    const run = await harness.run({ input, toolName:"remember_events+recall_memory+inspect_timeline", execute:async()=>{ session ??= await createMemorySession(inspector?.record); return { stored:await session.remember(events), recalled:await session.recall(subject), timeline:await session.timeline(subject) }; }, verify:({recalled,timeline})=>({ ok:recalled.memories.every((item)=>item.at&&item.source)&&timeline.events.length>=recalled.memories.length, message:"최신 기억의 시간·출처와 타임라인 추적성 계약 통과", metrics:{memoryCount:recalled.memories.length,evidenceCount:recalled.evidenceCount} }) });
    const { stored, recalled, timeline } = run.value;
    result.hidden = false;
    result.innerHTML = `<p class="status">event-memory-mcp · 3개 도구 연속 호출</p><h2>${subject}에 대한 최신 기억</h2><div class="grid">${recalled.memories.map((memory) => `<div class="card"><span class="tag">${memory.field}</span><h3>${memory.value}</h3><p>${memory.at}</p><small>근거: ${memory.source}</small></div>`).join("")}</div><h3>처리 결과</h3><p>${stored.received}건 수신 · ${stored.accepted}건 최신 상태 반영 · 전체 근거 ${recalled.evidenceCount}건</p><h3>타임라인</h3><pre>${JSON.stringify(timeline.events, null, 2)}</pre>`;
    harness.decorateResult(result, run.meta);
    renderTrace(inspector, "최신 기억과 타임라인 렌더링 완료", { memoryCount:recalled.memories.length, evidenceCount:recalled.evidenceCount });
  } catch (error) {
    if (error instanceof SyntaxError) inspector?.record({ operation:"tool/error", status:"error", error:"사건 데이터가 올바른 JSON 형식이 아닙니다." });
    renderDemoError(result, error instanceof SyntaxError ? new Error("사건 데이터가 올바른 JSON 형식이 아닙니다.") : error);
  }
});
