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

export function createMcpInspector({ anchor, testCommand, persistent = false, onReset = () => {} }) {
  if (!anchor || typeof document === "undefined") return null;
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
    <footer class="test-command"><span>이 데모 테스트</span><code>${escapeHtml(testCommand)}</code><button type="button" class="copy-button">명령 복사</button></footer>`;
  anchor.insertAdjacentElement("afterend", section);

  const list = section.querySelector(".trace-list");
  const empty = section.querySelector(".inspector-empty");
  let run = 0;

  function record(event) {
    if (!persistent && event.operation === "initialize") clear(false);
    if (event.operation === "initialize") run += 1;
    empty.hidden = true;
    const [number, label] = labels[event.operation] ?? ["–", event.operation];
    const item = document.createElement("li");
    item.className = `trace-item is-${event.status}`;
    const duration = event.durationMs === undefined ? "" : `<span>${event.durationMs.toFixed(1)}ms</span>`;
    item.innerHTML = `<div class="trace-marker">${number}</div><div class="trace-body"><div class="trace-title"><strong>${label}</strong><span class="status-pill">${event.status === "error" ? "오류" : "성공"}</span>${duration}<small>실행 #${Math.max(run,1)}</small></div>${event.summary ? `<p>${escapeHtml(event.summary)}</p>` : ""}${detailBlock("요청",event.request)}${detailBlock("응답",event.response)}${event.error ? `<p class="error-message">${escapeHtml(event.error)}</p>` : ""}</div>`;
    list.append(item);
    item.scrollIntoView({ behavior:"smooth", block:"nearest" });
  }

  function clear(notify = true) {
    list.replaceChildren();
    empty.hidden = false;
    run = 0;
    if (notify) onReset();
  }

  section.querySelector(".reset-button").addEventListener("click", () => clear(true));
  section.querySelector(".copy-button").addEventListener("click", async (event) => {
    await navigator.clipboard?.writeText(testCommand);
    event.currentTarget.textContent = "복사됨";
    setTimeout(() => { event.currentTarget.textContent = "명령 복사"; }, 1200);
  });
  return { record, clear, element: section };
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
