const catalog = {
  meeting: {
    server:"Filesystem MCP", license:"MIT", mode:"로컬 stdio · 폴더 권한 제한",
    repo:"https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem",
    wow:"수강생이 작성한 실제 transcript.md를 MCP가 읽고, 즉석에서 회의록 카드로 바꿉니다.",
    flow:"list_directory → read_text_file → create_meeting_notes"
  },
  quote: {
    server:"Git MCP", license:"Apache-2.0 / 기존 코드 MIT", mode:"로컬 stdio · 현재 저장소만",
    repo:"https://github.com/modelcontextprotocol/servers/tree/main/src/git",
    wow:"가격표 변경 전후 commit을 비교해 견적이 왜 달라졌는지 근거와 함께 보여줍니다.",
    flow:"git_log → git_diff → calculate_quote"
  },
  blueprint: {
    server:"Playwright MCP", license:"Apache-2.0", mode:"로컬 브라우저 자동화",
    repo:"https://github.com/microsoft/playwright-mcp",
    wow:"생성한 SVG 설계도를 실제 브라우저로 열고 스크린샷·콘솔·접근성 구조를 자동 검수합니다.",
    flow:"browser_navigate → browser_snapshot → browser_take_screenshot"
  },
  search: {
    server:"Fetch MCP + 공식 Docs MCP", license:"Fetch: MIT", mode:"원격 Streamable HTTP 라이브 체험",
    repo:"https://github.com/modelcontextprotocol/servers/tree/main/src/fetch",
    wow:"가상 문서가 아니라 공식 MCP 서버에 질문하고, 발견된 실제 도구와 문서 링크를 즉시 확인합니다.",
    flow:"initialize → tools/list → search_model_context_protocol",
    live:true
  },
  memory: {
    server:"Memory MCP", license:"Apache-2.0 / 기존 코드 MIT", mode:"로컬 stdio · 지식 그래프",
    repo:"https://github.com/modelcontextprotocol/servers/tree/main/src/memory",
    wow:"프로젝트·담당자·상태를 entity/relation으로 저장하고 다음 세션에서 관계 그래프로 다시 불러옵니다.",
    flow:"create_entities → create_relations → search_nodes"
  }
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" })[char]);
}

function parseResult(text) {
  const title = text.match(/^Title:\s*(.+)$/m)?.[1] ?? "공식 MCP 문서";
  const link = text.match(/^Link:\s*(https?:\/\/\S+)$/m)?.[1];
  const content = text.match(/^Content:\s*([\s\S]+)$/m)?.[1] ?? text;
  const safeLink = link?.startsWith("https://modelcontextprotocol.io/") ? link : null;
  return { title, link:safeLink, content:content.replace(/```[\s\S]*?```/g, "[코드 예시는 JSON에서 확인]").slice(0, 650) };
}

function liveTrace(data, query) {
  const rows = [
    ["01","LIVE initialize",{ endpoint:data.endpoint, transport:data.transport },{ protocolVersion:data.protocolVersion, serverInfo:data.serverInfo }],
    ["02","LIVE tools/list",{ method:"tools/list" },{ tools:data.tools }],
    ["03","LIVE tools/call",{ name:data.selectedTool, arguments:{ query } },{ resultCount:data.content.length }]
  ];
  return rows.map(([number,label,request,response]) => `<li><span>${number}</span><div><strong>${label}</strong><em>실제 응답</em><details><summary>요청·응답 JSON 보기</summary><pre>${escapeHtml(JSON.stringify({request,response},null,2))}</pre></details></div></li>`).join("");
}

export function mountOssExtension(project) {
  if (typeof document === "undefined") return null;
  const item = catalog[project];
  const main = document.querySelector("main");
  if (!item || !main) return null;
  const section = document.createElement("section");
  section.className = "oss-extension";
  section.innerHTML = `
    <header><div><span class="oss-badge">OPEN SOURCE MCP 확장</span><h2>Mock 다음 단계: 실제 MCP로 연결하기</h2><p>현재 학습 로직은 유지하고 데이터 입구 또는 검증 도구만 실제 OSS MCP로 교체합니다.</p></div><a href="${item.repo}" target="_blank" rel="noreferrer">공식 소스 보기 ↗</a></header>
    <div class="oss-grid">
      <article><span class="mini-label">추천 서버</span><h3>${item.server}</h3><p>${item.mode}</p><div class="license">오픈소스 라이선스 · ${item.license}</div></article>
      <article class="wow-card"><span class="mini-label">WOW MOMENT</span><h3>결과가 실제 외부 도구와 연결됩니다</h3><p>${item.wow}</p></article>
    </div>
    <div class="oss-flow"><strong>확장 흐름</strong><code>${item.flow}</code></div>
    <section class="connection-demo" aria-label="외부 MCP 화면 연결 시연">
      <div><span class="mini-label">화면 연결 시연</span><strong>외부 MCP가 연결되는 과정을 확인하세요</strong><p>실제 고객 데이터나 쓰기 권한 없이 교육용 연결 단계를 재현합니다.</p></div>
      <button type="button" class="connection-button">연결 과정 보기</button>
      <ol class="connection-stages" hidden>
        ${item.flow.split(" → ").map((stage,index) => `<li><span>${String(index+1).padStart(2,"0")}</span><strong>${escapeHtml(stage)}</strong><em>대기</em></li>`).join("")}
      </ol>
      <p class="connection-status" role="status">연결 시연 전</p>
    </section>
    ${item.live ? `<div class="live-lab"><div><span class="live-badge">● LIVE · 공식 외부 MCP</span><h3>공식 MCP 문서 서버에 직접 질문하기</h3><p>고정된 공식 endpoint를 Streamable HTTP로 호출합니다. 인증과 쓰기 권한은 사용하지 않습니다.</p></div><form><input name="liveQuery" value="tools/list와 tools/call의 차이는 무엇인가요?" maxlength="200" aria-label="공식 MCP 문서 질문"><button>실제 MCP 호출</button></form><p class="live-status">연결 전</p><ol class="live-trace"></ol><div class="live-results"></div></div>` : ""}`;
  main.append(section);

  section.querySelector(".connection-button")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    const stages = [...section.querySelectorAll(".connection-stages li")];
    const stageList = section.querySelector(".connection-stages");
    const status = section.querySelector(".connection-status");
    stageList.hidden = false;
    button.disabled = true;
    status.className = "connection-status";
    stages.forEach((stage) => {
      stage.classList.remove("is-running","is-complete");
      stage.querySelector("em").textContent = "대기";
    });
    for (let index = 0; index < stages.length; index += 1) {
      const stage = stages[index];
      stage.classList.add("is-running");
      stage.querySelector("em").textContent = "진행 중";
      status.textContent = `${stage.querySelector("strong").textContent} 단계를 실행하고 있습니다.`;
      await new Promise((resolve) => setTimeout(resolve, 260));
      stage.classList.remove("is-running");
      stage.classList.add("is-complete");
      stage.querySelector("em").textContent = "완료";
    }
    status.className = "connection-status is-success";
    status.textContent = item.live ? "연결 구조 확인 완료. 아래에서 공식 MCP를 실제 호출할 수 있습니다." : "교육용 연결 구조 시연이 완료되었습니다.";
    button.disabled = false;
    button.textContent = "다시 보기";
  });

  const form = section.querySelector(".live-lab form");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const query = new FormData(form).get("liveQuery").trim();
    const button = form.querySelector("button");
    const status = section.querySelector(".live-status");
    const trace = section.querySelector(".live-trace");
    const results = section.querySelector(".live-results");
    button.disabled = true;
    status.className = "live-status is-loading";
    status.textContent = "공식 서버 연결 → 도구 조회 → 검색 실행 중…";
    trace.replaceChildren(); results.replaceChildren();
    try {
      const response = await fetch("/api/oss-mcp/docs-search", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({query}) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "외부 MCP 연결 실패");
      status.className = "live-status is-success";
      status.textContent = `${data.serverInfo.name} ${data.serverInfo.version} 연결 성공 · 실제 도구 ${data.tools.length}개 발견`;
      trace.innerHTML = liveTrace(data, query);
      results.innerHTML = data.content.map((text) => parseResult(text)).map((result) => `<article><span>공식 문서</span><h4>${escapeHtml(result.title)}</h4><p>${escapeHtml(result.content)}</p>${result.link ? `<a href="${result.link}" target="_blank" rel="noreferrer">원문 열기 ↗</a>` : ""}</article>`).join("");
    } catch (error) {
      status.className = "live-status is-error";
      status.textContent = `연결 실패: ${error.message}`;
    } finally {
      button.disabled = false;
    }
  });
  return section;
}
