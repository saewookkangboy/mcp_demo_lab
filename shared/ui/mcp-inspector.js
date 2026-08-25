const labels = {
  "initialize": ["01", "Client 연결 및 초기화"],
  "tools/list": ["02", "사용 가능한 도구 조회"],
  "tools/call": ["03", "도구 호출 요청"],
  "tool/result": ["04", "도구 결과 반환"],
  "tool/error": ["04", "도구 실행 오류"],
  "render": ["05", "프런트엔드 렌더링"]
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" })[char]);
}

function detailBlock(title, value) {
  if (value === undefined) return "";
  const json = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  return `<details><summary>${title} JSON 보기</summary><pre>${escapeHtml(json)}</pre></details>`;
}

export function createMcpInspector({ anchor, persistent = false, onReset = () => {} }) {
  if (!anchor || typeof document === "undefined") return null;
  if (new URLSearchParams(window.location.search).get("present") === "1") document.body.classList.add("is-presented");
  const section = document.createElement("section");
  section.className = "mcp-inspector";
  section.setAttribute("aria-label", "MCP 실행 과정");
  section.innerHTML = `
    <header class="inspector-header">
      <div><span class="mock-badge"><span aria-hidden="true">●</span> 교육용 MOCK MCP</span><h2>MCP 실행 과정</h2><p>initialize → tools/list → tools/call → result → render</p></div>
      <button type="button" class="reset-button">실행 초기화</button>
    </header>
    <div class="inspector-empty"><strong>아직 실행 기록이 없습니다.</strong><span>위 입력을 실행하면 Client와 Server 사이의 요청·응답이 여기에 표시됩니다.</span></div>
    <ol class="trace-list" aria-live="polite"></ol>
    <footer class="screen-check"><div><strong>화면 검증</strong><span class="screen-check-status">실행 기록이 생기면 화면에서 바로 검증할 수 있습니다.</span></div><button type="button" class="screen-check-button">화면 검증 실행</button></footer>`;
  anchor.insertAdjacentElement("afterend", section);

  const list = section.querySelector(".trace-list");
  const empty = section.querySelector(".inspector-empty");
  const checkStatus = section.querySelector(".screen-check-status");
  const checkButton = section.querySelector(".screen-check-button");
  const events = [];
  let run = 0;

  function record(event) {
    if (!persistent && event.operation === "initialize") clear(false);
    if (event.operation === "initialize") run += 1;
    events.push(event);
    empty.hidden = true;
    const [number, label] = labels[event.operation] ?? ["-", event.operation];
    const item = document.createElement("li");
    item.className = `trace-item is-${event.status}`;
    const duration = event.durationMs === undefined ? "" : `<span>${event.durationMs.toFixed(1)}ms</span>`;
    item.innerHTML = `<div class="trace-marker">${number}</div><div class="trace-body"><div class="trace-title"><strong>${label}</strong><span class="status-pill">${event.status === "error" ? "오류" : "성공"}</span>${duration}<small>실행 #${Math.max(run,1)}</small></div>${event.summary ? `<p>${escapeHtml(event.summary)}</p>` : ""}${detailBlock("요청",event.request)}${detailBlock("응답",event.response)}${event.error ? `<p class="error-message">${escapeHtml(event.error)}</p>` : ""}</div>`;
    list.append(item);
    item.scrollIntoView({ behavior:"smooth", block:"nearest" });
    window.parent?.postMessage({ type:"mcp-demo:trace", label, status:event.status }, window.location.origin);
  }

  function clear(notify = true) {
    list.replaceChildren();
    events.length = 0;
    empty.hidden = false;
    run = 0;
    checkStatus.textContent = "실행 기록이 생기면 화면에서 바로 검증할 수 있습니다.";
    checkStatus.className = "screen-check-status";
    if (notify) onReset();
  }

  function verifyScreen() {
    const latestStart = events.map((event,index) => event.operation === "initialize" ? index : -1).filter((index) => index >= 0).at(-1);
    const latest = latestStart === undefined ? [] : events.slice(latestStart);
    const required = ["initialize","tools/list","tools/call","tool/result","render"];
    const missing = required.filter((operation) => !latest.some((event) => event.operation === operation && event.status === "success"));
    const hasError = latest.some((event) => event.status === "error");
    const ok = latest.length > 0 && missing.length === 0 && !hasError;
    const message = latest.length === 0 ? "먼저 기본 입력을 실행해 주세요." : hasError ? "오류 단계가 있습니다. 입력을 확인해 주세요." : missing.length ? `${missing.join(", ")} 단계가 아직 없습니다.` : "5단계 MCP 흐름과 화면 결과를 모두 확인했습니다.";
    checkStatus.textContent = message;
    checkStatus.className = `screen-check-status ${ok ? "is-success" : "is-warning"}`;
    window.parent?.postMessage({ type:"mcp-demo:verified", ok, message }, window.location.origin);
    return ok;
  }

  section.querySelector(".reset-button").addEventListener("click", () => clear(true));
  checkButton.addEventListener("click", verifyScreen);
  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type === "mcp-demo:run") document.querySelector("form")?.requestSubmit();
    if (event.data?.type === "mcp-demo:run-screen-check") verifyScreen();
  });
  return { record, clear, verifyScreen, element: section };
}

export function renderTrace(inspector, summary, response) {
  inspector?.record({ operation:"render", status:"success", at:new Date().toISOString(), summary, response });
}

export function renderDemoError(target, error) {
  if (!target) return;
  target.hidden = false;
  target.classList.add("is-error");
  target.innerHTML = `<h2>입력을 확인해 주세요</h2><p>${escapeHtml(error.message)}</p>`;
}
