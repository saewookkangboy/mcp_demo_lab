import { HarnessError, runExecutionHarness } from "../harness/execution-harness.js";

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" })[char]);
}

function renderMeta(column, meta, error) {
  column.classList.remove("is-empty","is-success","is-error");
  if (error) {
    column.classList.add("is-error");
    column.querySelector(".compare-state").textContent = error.stage ? `${error.stage} 단계 차단` : "실행 오류";
    column.querySelector(".compare-body").innerHTML = `<p>${escapeHtml(error.message)}</p>`;
    return;
  }
  column.classList.add("is-success");
  const applied = meta.mode === "applied";
  column.querySelector(".compare-state").textContent = applied ? "검증 완료" : "직접 실행 완료";
  column.querySelector(".compare-body").innerHTML = applied
    ? `<ul><li>입력 사전검증 통과</li><li>도구 허용 목록 확인</li><li>출력 계약 검증 통과</li><li>실행 증거 생성</li></ul><details><summary>Harness 증거 JSON 보기</summary><pre>${escapeHtml(JSON.stringify(meta.evidence,null,2))}</pre></details><small>${meta.durationMs.toFixed(1)}ms</small>`
    : `<p>결과는 생성됐지만 Harness가 우회되어 사전검증·도구 정책·출력 계약·실행 증거가 없습니다.</p><details><summary>미검증 실행 정보</summary><pre>${escapeHtml(JSON.stringify({toolName:meta.toolName,inputKeys:meta.inputKeys,outputKeys:meta.outputKeys},null,2))}</pre></details><small>${meta.durationMs.toFixed(1)}ms</small>`;
}

export function createHarnessController({ anchor, project, required, allowedTools }) {
  if (!anchor || typeof document === "undefined") return null;
  let enabled = true;
  const section = document.createElement("section");
  section.className = "harness-panel";
  section.setAttribute("aria-label", "Harness 적용 전후 비교");
  section.innerHTML = `
    <header><div><span class="harness-kicker">EXECUTION HARNESS</span><h2>Harness 적용 전후 비교</h2><p>같은 입력을 토글해서 실행하면 마지막 결과가 양쪽에 남습니다.</p></div><button type="button" class="harness-switch is-on" role="switch" aria-checked="true"><span class="switch-track"><span></span></span><strong>Harness 적용</strong></button></header>
    <div class="harness-definition"><span>적용 시</span> 입력 사전검증 → 도구 허용 목록 → MCP 실행 → 결과 계약 검증 → 실행 증거</div>
    <div class="compare-grid">
      <article class="compare-column is-empty" data-mode="bypassed"><div><span class="mode-badge off">미적용</span><strong class="compare-state">실행 전</strong></div><div class="compare-body"><p>토글을 끄고 실행하면 결과가 여기에 남습니다.</p></div></article>
      <article class="compare-column is-empty" data-mode="applied"><div><span class="mode-badge on">적용</span><strong class="compare-state">실행 전</strong></div><div class="compare-body"><p>토글을 켜고 실행하면 검증 증거가 여기에 남습니다.</p></div></article>
    </div><button type="button" class="compare-reset">비교 기록 초기화</button>`;
  anchor.insertAdjacentElement("beforebegin", section);
  const toggle = section.querySelector(".harness-switch");
  const columns = {
    bypassed:section.querySelector('[data-mode="bypassed"]'),
    applied:section.querySelector('[data-mode="applied"]')
  };

  function setEnabled(next) {
    enabled = next;
    toggle.classList.toggle("is-on", enabled);
    toggle.setAttribute("aria-checked", String(enabled));
    toggle.querySelector("strong").textContent = enabled ? "Harness 적용" : "Harness 미적용";
  }
  toggle.addEventListener("click", () => setEnabled(!enabled));
  section.querySelector(".compare-reset").addEventListener("click", () => {
    for (const [mode,column] of Object.entries(columns)) {
      column.className = "compare-column is-empty";
      column.querySelector(".compare-state").textContent = "실행 전";
      column.querySelector(".compare-body").innerHTML = `<p>Harness ${mode === "applied" ? "적용" : "미적용"} 실행 결과가 여기에 남습니다.</p>`;
    }
  });

  async function run({ input, toolName, execute, verify }) {
    const mode = enabled ? "applied" : "bypassed";
    try {
      const result = await runExecutionHarness({ enabled, input, required, allowedTools, toolName, execute, verify });
      renderMeta(columns[mode], result.meta);
      return result;
    } catch (error) {
      renderMeta(columns[mode], null, error);
      throw error;
    }
  }

  function decorateResult(target, meta) {
    if (!target || !meta) return;
    const badge = document.createElement("div");
    badge.className = `harness-result-badge ${meta.mode === "applied" ? "is-applied" : "is-bypassed"}`;
    badge.textContent = meta.mode === "applied" ? `Harness 적용 · 검증 완료 · ${meta.evidence.id}` : "Harness 미적용 · 결과 미검증";
    target.prepend(badge);
  }

  return { run, decorateResult, setEnabled, isEnabled:() => enabled, element:section, project };
}

export { HarnessError };
