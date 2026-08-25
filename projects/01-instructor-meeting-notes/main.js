import { createMockMcpClient } from "../../shared/mcp/mock-mcp-client.js";
import { createMcpInspector, renderDemoError, renderTrace } from "../../shared/ui/mcp-inspector.js";
import { mountOssExtension } from "../../shared/ui/oss-extension.js";
import { createHarnessController } from "../../shared/ui/harness-controller.js";
import { createMeetingServer } from "./src/server.js";

export async function generateMeetingNotes(transcript, onTrace) {
  const client = createMockMcpClient(createMeetingServer(), { onTrace });
  await client.connect();
  await client.listTools();
  return client.callTool("create_meeting_notes", { transcript });
}

const document = globalThis.document ?? { querySelector: () => null };
const form = document.querySelector("form");
const result = document.querySelector("#result");
const inspector = createMcpInspector({
  anchor: form,
  onReset: () => { form.reset(); result.hidden = true; result.classList.remove("is-error"); }
});
const harness = createHarnessController({ anchor:form, project:"meeting", required:["transcript"], allowedTools:["create_meeting_notes"] });

if (form) form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector("button");
  button.disabled = true;
  result.classList.remove("is-error");
  try {
    const input = { transcript:form.transcript.value };
    const run = await harness.run({ input, toolName:"create_meeting_notes", execute:()=>generateMeetingNotes(input.transcript, inspector?.record), verify:(data)=>({ ok:data.actionItems.every((item)=>item.owner&&item.task&&item.due), message:"모든 실행 항목에 담당자·업무·마감일 존재", metrics:{actionItemCount:data.actionItems.length} }) });
    const data = run.value;
    result.hidden = false;
    result.innerHTML = `<p class="status">meeting-notes-mcp · create_meeting_notes</p><h2>${data.title}</h2><p>${data.date} · ${data.attendees.join(", ")}</p><p>${data.summary}</p><h3>결정 사항</h3><ul>${data.decisions.map((item) => `<li>${item}</li>`).join("")}</ul><h3>실행 항목</h3><div class="grid">${data.actionItems.map((item) => `<div class="card"><strong>${item.owner}</strong><p>${item.task}</p><small>${item.due}</small></div>`).join("")}</div>`;
    harness.decorateResult(result, run.meta);
    renderTrace(inspector, "회의록 카드 렌더링 완료", { title: data.title, actionItemCount: data.actionItems.length });
  } catch (error) {
    renderDemoError(result, error);
  } finally {
    button.disabled = false;
  }
});
mountOssExtension("meeting");
