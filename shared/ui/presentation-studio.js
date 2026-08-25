const demos = [
  { path:"01-instructor-meeting-notes", level:"강사 시연", title:"회의록 작성", note:"텍스트가 구조화 결과로 바뀌는 과정", steps:["기본 회의 원문을 확인합니다.","MCP 요청과 결과 JSON을 펼칩니다.","담당자와 마감일이 모두 있는지 검증합니다."] },
  { path:"02-instructor-quote", level:"강사 시연", title:"견적서 작성", note:"같은 입력으로 재현 가능한 계산", steps:["서비스와 수량이 도구 인자가 됨을 확인합니다.","공급가와 세금 계산 결과를 봅니다.","수량을 0으로 바꿔 오류 흐름을 보여줍니다."] },
  { path:"03-beginner-blueprint", level:"초급", title:"설계도 제작", note:"숫자 입력이 SVG 결과로 변환되는 과정", steps:["가로, 세로, 용도를 확인합니다.","반환된 면적과 SVG를 함께 봅니다.","2m 미만 입력이 차단되는지 확인합니다."] },
  { path:"04-intermediate-conversational-search", level:"중급", title:"대화형 검색", note:"답변과 근거가 함께 반환되는 검색", steps:["질문을 실행해 문서 근거를 확인합니다.","후속 질문으로 대화 맥락을 보여줍니다.","공식 Docs MCP 연결은 화면 버튼으로 실행합니다."] },
  { path:"05-advanced-memory", level:"고급", title:"데이터 기반 메모리", note:"시간순 사건에서 최신 상태를 기억하는 과정", steps:["세 개의 사건 데이터를 저장합니다.","최신 상태와 출처를 확인합니다.","원본 타임라인으로 기억의 근거를 검증합니다."] }
];
const frame = document.querySelector("#demo-frame");
const loading = document.querySelector("#stage-loading");
const nav = document.querySelector("#demo-nav");
const harness = document.querySelector("#global-harness");
const status = document.querySelector("#studio-status");
let current = 0;
let harnessEnabled = true;
nav.innerHTML = demos.map((demo,index) => `<button type="button" data-index="${index}"><span>${String(index+1).padStart(2,"0")}</span><span><strong>${demo.title}</strong><small>${demo.level}</small></span></button>`).join("");
function send(message) { frame.contentWindow?.postMessage(message, window.location.origin); }
function render(index) {
  current = Math.max(0, Math.min(demos.length - 1, index));
  const demo = demos[current];
  loading.hidden = false;
  frame.classList.remove("is-ready");
  frame.src = `/projects/${demo.path}/?present=1`;
  document.querySelector("#progress-text").textContent = `${current + 1} / ${demos.length}`;
  document.querySelector("#progress-fill").style.transform = `scaleX(${(current + 1) / demos.length})`;
  document.querySelector("#note-title").textContent = demo.note;
  document.querySelector("#note-list").innerHTML = demo.steps.map((step) => `<li>${step}</li>`).join("");
  [...nav.querySelectorAll("button")].forEach((button,buttonIndex) => { button.classList.toggle("is-active", buttonIndex === current); button.setAttribute("aria-current", buttonIndex === current ? "page" : "false"); });
  document.querySelector("#previous-demo").disabled = current === 0;
  document.querySelector("#next-demo").disabled = current === demos.length - 1;
  status.textContent = `${demo.title} 화면을 준비하고 있습니다.`;
}
frame.addEventListener("load", () => { loading.hidden = true; frame.classList.add("is-ready"); send({ type:"mcp-demo:harness", enabled:harnessEnabled }); status.textContent = `${demos[current].title} 준비 완료. 기본 입력을 실행하세요.`; });
nav.addEventListener("click", (event) => { const button = event.target.closest("button[data-index]"); if (button) render(Number(button.dataset.index)); });
harness.addEventListener("click", () => {
  harnessEnabled = !harnessEnabled;
  harness.classList.toggle("is-on", harnessEnabled);
  harness.setAttribute("aria-checked", String(harnessEnabled));
  harness.querySelector("strong").textContent = harnessEnabled ? "Harness 적용" : "Harness 미적용";
  send({ type:"mcp-demo:harness", enabled:harnessEnabled });
  status.textContent = `현재 데모에 Harness ${harnessEnabled ? "적용" : "미적용"} 설정을 전달했습니다.`;
});
document.querySelector("#previous-demo").addEventListener("click", () => render(current - 1));
document.querySelector("#next-demo").addEventListener("click", () => render(current + 1));
document.querySelector("#run-demo").addEventListener("click", () => { send({ type:"mcp-demo:run" }); status.textContent = "기본 입력으로 MCP 도구를 실행하고 있습니다."; });
document.querySelector("#verify-demo").addEventListener("click", () => { send({ type:"mcp-demo:run-screen-check" }); status.textContent = "현재 화면의 MCP 단계와 결과를 검증하고 있습니다."; });
window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin || event.source !== frame.contentWindow) return;
  if (event.data?.type === "mcp-demo:trace") status.textContent = `${event.data.label} 단계가 기록되었습니다.`;
  if (event.data?.type === "mcp-demo:verified") status.textContent = event.data.ok ? "화면 검증을 통과했습니다." : `화면 검증 필요: ${event.data.message}`;
});
render(0);
