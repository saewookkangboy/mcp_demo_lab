import { createMockMcpClient } from "../../shared/mcp/mock-mcp-client.js";
import { createMcpInspector, renderDemoError, renderTrace } from "../../shared/ui/mcp-inspector.js";
import { mountOssExtension } from "../../shared/ui/oss-extension.js";
import { createHarnessController } from "../../shared/ui/harness-controller.js";
import { createSearchServer } from "./src/server.js";

export async function searchKnowledge(query, history = [], onTrace) {
  const client = createMockMcpClient(createSearchServer(), { onTrace });
  await client.connect();
  await client.listTools();
  return client.callTool("search_knowledge", { query, history });
}

const document = globalThis.document ?? { querySelector: () => null };
const history = [];
const form = document.querySelector("form");
const panel = form?.closest(".panel");
const chat = document.querySelector("#chat");
const historyCount = document.querySelector("#history-count");
const errorTarget = document.querySelector("#search-error");
const inspector = createMcpInspector({
  anchor: panel,
  persistent: true,
  testCommand: "node --test projects/04-intermediate-conversational-search/tests/app.test.js",
  onReset: () => { history.length = 0; chat.replaceChildren(); historyCount.textContent = "대화 0턴"; errorTarget.hidden = true; form.reset(); }
});
const harness = createHarnessController({ anchor:form, project:"search", required:["query"], allowedTools:["search_knowledge"] });
mountOssExtension("search");

if (form) form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = form.query.value.trim();
  if (!query) return;
  errorTarget.hidden = true;
  try {
    const input = { query, history:[...history] };
    const run = await harness.run({ input, toolName:"search_knowledge", execute:()=>searchKnowledge(query, history, inspector?.record), verify:(data)=>({ ok:Array.isArray(data.citations)&&data.citations.every((item)=>item.id&&item.title), message:"답변 근거 배열과 citation 계약 통과", metrics:{citationCount:data.citations.length,usedHistory:data.usedHistory} }) });
    const data = run.value;
    history.push({ role:"user", content:query }, { role:"assistant", content:data.answer });
    chat.insertAdjacentHTML("beforeend", `<div class="card"><strong>나</strong><p>${query}</p></div><div class="card"><strong>검색 Agent</strong><p>${data.answer}</p>${data.citations.map((citation) => `<span class="tag">${citation.id} · ${citation.title}</span>`).join(" ")}</div>`);
    harness.decorateResult(chat.lastElementChild, run.meta);
    form.reset();
    historyCount.textContent = `대화 ${history.length / 2}턴 · 이번 검색에서 이전 메시지 ${data.usedHistory}개 사용`;
    renderTrace(inspector, `대화 ${history.length / 2}턴 렌더링 완료`, { citationCount:data.citations.length, usedHistory:data.usedHistory });
  } catch (error) {
    renderDemoError(errorTarget, error);
  }
});
