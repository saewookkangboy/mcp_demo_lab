import { createMockMcpClient } from "../../shared/mcp/mock-mcp-client.js";
import { createMcpInspector, renderDemoError, renderTrace } from "../../shared/ui/mcp-inspector.js";
import { mountOssExtension } from "../../shared/ui/oss-extension.js";
import { createHarnessController } from "../../shared/ui/harness-controller.js";
import { createQuoteServer } from "./src/server.js";

export async function calculateQuote(input, onTrace) {
  const client = createMockMcpClient(createQuoteServer(), { onTrace });
  await client.connect();
  await client.listTools();
  return client.callTool("calculate_quote", input);
}

const document = globalThis.document ?? { querySelector: () => null };
const form = document.querySelector("form");
const result = document.querySelector("#result");
const inspector = createMcpInspector({
  anchor: form,
  testCommand: "node --test projects/02-instructor-quote/tests/app.test.js",
  onReset: () => { form.reset(); result.hidden = true; result.classList.remove("is-error"); }
});
const harness = createHarnessController({ anchor:form, project:"quote", required:["service","quantity"], allowedTools:["calculate_quote"] });
mountOssExtension("quote");

if (form) form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const fields = new FormData(form);
  result.classList.remove("is-error");
  try {
    const input = { service:fields.get("service"), quantity:Number(fields.get("quantity")) };
    const run = await harness.run({ input, toolName:"calculate_quote", execute:()=>calculateQuote(input, inspector?.record), verify:(data)=>({ ok:data.total===data.subtotal+data.tax&&data.total>0, message:"합계 = 공급가 + 부가세 계약 통과", metrics:{total:data.total} }) });
    const data = run.value;
    const won = (number) => new Intl.NumberFormat("ko-KR", { style:"currency", currency:"KRW" }).format(number);
    result.hidden = false;
    result.innerHTML = `<p class="status">quote-mcp · ${data.quoteId}</p><h2>${data.service} 견적</h2><div class="grid"><div class="card">수량<br><strong>${data.quantity}</strong></div><div class="card">공급가<br><strong>${won(data.subtotal)}</strong></div><div class="card">부가세<br><strong>${won(data.tax)}</strong></div></div><h2>합계 ${won(data.total)}</h2><p>유효기간: ${data.validUntil}</p>`;
    harness.decorateResult(result, run.meta);
    renderTrace(inspector, "견적 카드 렌더링 완료", { quoteId: data.quoteId, total: data.total, currency: data.currency });
  } catch (error) {
    renderDemoError(result, error);
  }
});
