import { HarnessError, runExecutionHarness } from "../harness/execution-harness.js";

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" })[char]);
}

function envelopeHtml(envelope) {
  return `<div class="result-envelope" data-decision="${escapeHtml(envelope.decision)}">
    <div><span>최종 전달값</span><strong>${escapeHtml(envelope.decision)}</strong></div>
    <dl>
      <div><dt>신뢰 상태</dt><dd>${escapeHtml(envelope.assurance)}</dd></div>
      <div><dt>화면 전달</dt><dd>${envelope.deliverable ? "허용" : "차단"}</dd></div>
      <div><dt>실행 증거</dt><dd>${escapeHtml(envelope.evidenceId ?? "NONE")}</dd></div>
    </dl>
  </div>`;
}

function renderMeta(column, meta, error, { mode, contractLabel }) {
  column.classList.remove("is-empty","is-success","is-error");
  if (error) {
    column.classList.add("is-error");
    column.querySelector(".compare-state").textContent = error.stage ? `${error.stage} 단계 차단` : "실행 오류";
    const applied = mode === "applied";
    const evidence = error.evidence ?? {};
    const envelope = applied
      ? { decision:evidence.decision ?? "BLOCK", assurance:evidence.assurance ?? "REJECTED", deliverable:false, evidenceId:evidence.id ?? "NONE" }
      : { decision:"ERROR", assurance:"UNVERIFIED", deliverable:false, evidenceId:null };
    column.querySelector(".compare-body").innerHTML = `${envelopeHtml(envelope)}<p>${escapeHtml(error.message)}</p><details><summary>최종 오류 결과 JSON 보기</summary><pre>${escapeHtml(JSON.stringify({ ...envelope, stage:error.stage ?? "tool", contract:contractLabel },null,2))}</pre></details>`;
    return;
  }
  column.classList.add("is-success");
  const applied = meta.mode === "applied";
  column.querySelector(".compare-state").textContent = applied ? "검증 완료" : "직접 실행 완료";
  const envelope = {
    decision:meta.decision,
    assurance:meta.assurance,
    deliverable:meta.deliverable,
    evidenceId:meta.evidence?.id ?? null
  };
  column.querySelector(".compare-body").innerHTML = applied
    ? `${envelopeHtml(envelope)}<ul><li>입력 계약 통과</li><li>도구 권한 정책 통과</li><li>${escapeHtml(contractLabel)} 계약 통과</li><li>추적 가능한 실행 증거 생성</li></ul><details><summary>Harness 최종 결과 JSON 보기</summary><pre>${escapeHtml(JSON.stringify({ ...envelope, contract:contractLabel, evidence:meta.evidence },null,2))}</pre></details><small>${meta.durationMs.toFixed(1)}ms</small>`
    : `${envelopeHtml(envelope)}<p>업무 데이터는 생성됐지만 계약 검증 없이 그대로 화면에 전달됩니다.</p><details><summary>미적용 최종 결과 JSON 보기</summary><pre>${escapeHtml(JSON.stringify({ ...envelope, toolName:meta.toolName, outputKeys:meta.outputKeys },null,2))}</pre></details><small>${meta.durationMs.toFixed(1)}ms</small>`;
}

export function createHarnessController({ anchor, project, required, allowedTools, contractLabel = "출력 결과" }) {
  if (!anchor || typeof document === "undefined") return null;
  let enabled = true;
  const section = document.createElement("section");
  section.className = "harness-panel";
  section.setAttribute("aria-label", "Harness 적용 전후 비교");
  section.innerHTML = `
    <header><div><span class="harness-kicker">HARNESS ENGINEERING</span><h2>Harness 적용 전후 결과 비교</h2><p>업무 데이터뿐 아니라 최종 전달 결정과 신뢰 상태가 어떻게 달라지는지 확인합니다.</p></div><button type="button" class="harness-switch is-on" role="switch" aria-checked="true"><span class="switch-track"><span></span></span><strong>Harness 적용</strong></button></header>
    <div class="harness-definition"><span>적용 시</span> Source of Truth → 입력 계약 → 도구 권한 → MCP 실행 → ${escapeHtml(contractLabel)} 검증 → Trace 증거</div>
    <div class="harness-impact-note"><strong>정상 입력</strong><span>업무 값은 유지되고 <code>VERIFIED / ALLOW / 증거 ID</code>가 추가됩니다.</span><strong>계약 위반</strong><span>불완전 결과를 <code>BLOCK / REJECTED</code>로 바꿔 화면 전달을 막습니다.</span></div>
    <div class="compare-grid">
      <article class="compare-column is-empty" data-mode="bypassed"><div><span class="mode-badge off">미적용</span><strong class="compare-state">실행 전</strong></div><div class="compare-body"><p>토글을 끄고 실행하면 결과가 여기에 남습니다.</p></div></article>
      <article class="compare-column is-empty" data-mode="applied"><div><span class="mode-badge on">적용</span><strong class="compare-state">실행 전</strong></div><div class="compare-body"><p>토글을 켜고 실행하면 검증 증거가 여기에 남습니다.</p></div></article>
    </div><div class="compare-actions"><button type="button" class="contract-demo-button">계약 위반 결과 비교</button><button type="button" class="compare-reset">비교 기록 초기화</button></div>`;
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
  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type === "mcp-demo:harness") setEnabled(Boolean(event.data.enabled));
  });
  section.querySelector(".compare-reset").addEventListener("click", () => {
    for (const [mode,column] of Object.entries(columns)) {
      column.className = "compare-column is-empty";
      column.querySelector(".compare-state").textContent = "실행 전";
      column.querySelector(".compare-body").innerHTML = `<p>Harness ${mode === "applied" ? "적용" : "미적용"} 실행 결과가 여기에 남습니다.</p>`;
    }
  });
  section.querySelector(".contract-demo-button").addEventListener("click", () => {
    const bypassed = columns.bypassed;
    const applied = columns.applied;
    bypassed.className = "compare-column is-error";
    applied.className = "compare-column is-blocked";
    bypassed.querySelector(".compare-state").textContent = "불완전 결과 전달";
    bypassed.querySelector(".compare-body").innerHTML = `${envelopeHtml({ decision:"PASS_THROUGH", assurance:"UNVERIFIED", deliverable:true, evidenceId:null })}<p><strong>${escapeHtml(contractLabel)}</strong> 조건이 깨져도 검사하지 않아 불완전 결과가 화면까지 도달합니다.</p><details><summary>미적용 결과 JSON 보기</summary><pre>${escapeHtml(JSON.stringify({ decision:"PASS_THROUGH", assurance:"UNVERIFIED", deliverable:true, contractChecked:false, evidenceId:null },null,2))}</pre></details>`;
    applied.querySelector(".compare-state").textContent = "계약 위반 차단";
    applied.querySelector(".compare-body").innerHTML = `${envelopeHtml({ decision:"BLOCK", assurance:"REJECTED", deliverable:false, evidenceId:"DEMO-BLOCK-EVIDENCE" })}<p><strong>${escapeHtml(contractLabel)}</strong> 조건 불일치를 감지해 화면 전달 전에 차단하고 실패 근거를 남깁니다.</p><details><summary>적용 결과 JSON 보기</summary><pre>${escapeHtml(JSON.stringify({ decision:"BLOCK", assurance:"REJECTED", deliverable:false, stage:"postcondition", contract:contractLabel, evidenceId:"DEMO-BLOCK-EVIDENCE" },null,2))}</pre></details>`;
  });

  async function run({ input, toolName, execute, verify }) {
    const mode = enabled ? "applied" : "bypassed";
    try {
      const result = await runExecutionHarness({ enabled, input, required, allowedTools, toolName, execute, verify });
      renderMeta(columns[mode], result.meta, null, { mode, contractLabel });
      return result;
    } catch (error) {
      renderMeta(columns[mode], null, error, { mode, contractLabel });
      throw error;
    }
  }

  function decorateResult(target, meta) {
    if (!target || !meta) return;
    const assurance = document.createElement("section");
    assurance.className = `result-assurance ${meta.mode === "applied" ? "is-applied" : "is-bypassed"}`;
    assurance.setAttribute("aria-label", "Harness 최종 전달 상태");
    assurance.innerHTML = `<div><span>최종 전달 상태</span><strong>${escapeHtml(meta.decision)} / ${escapeHtml(meta.assurance)}</strong></div><dl><div><dt>화면 전달</dt><dd>${meta.deliverable ? "허용" : "차단"}</dd></div><div><dt>계약</dt><dd>${meta.mode === "applied" ? escapeHtml(contractLabel) : "검증 안 함"}</dd></div><div><dt>증거 ID</dt><dd>${escapeHtml(meta.evidence?.id ?? "NONE")}</dd></div></dl>`;
    target.prepend(assurance);
  }

  return { run, decorateResult, setEnabled, isEnabled:() => enabled, element:section, project };
}

export { HarnessError };
