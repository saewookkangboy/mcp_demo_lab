export const missions = [
  {
    id:"MISSION-01",
    level:"초급",
    title:"견적 할인 정책 추가",
    project:"02 견적서 작성",
    path:"02-instructor-quote",
    goal:"고객 유형에 따라 할인액과 최종 합계를 계산하고 근거를 화면에 표시합니다.",
    tool:"calculate_quote",
    input:"customerType: standard | partner",
    output:"discountAmount, finalTotal, discountReason",
    harness:"할인율 범위, 음수 금액, 최종 합계 계산을 검증",
    tests:["일반 고객은 할인 0원","파트너 고객은 정해진 할인 적용","알 수 없는 고객 유형은 호출 전에 차단"],
    prompt:`Next Stage MISSION-01을 수행해주세요.\n\n대상은 projects/02-instructor-quote입니다.\n먼저 기존 README, src/server.js, main.js, 테스트를 읽으세요.\n\n목표:\n- calculate_quote에 customerType 입력 추가\n- standard와 partner만 허용\n- discountAmount, finalTotal, discountReason 반환\n- FE에 할인 전 합계, 할인액, 최종 합계 표시\n- Harness에서 할인율·음수 금액·최종 합계 계약 검증\n\n작업 순서:\n1. 실패하는 학습자 테스트 3개를 먼저 작성하고 실행\n2. 최소 구현으로 테스트 통과\n3. FE 연결\n4. Harness 미적용·적용·계약 위반 비교\n5. npm run verify 실행\n\n기존 가격과 세율은 바꾸지 말고, 각 단계 결과와 Diff를 보여주세요.`
  },
  {
    id:"MISSION-02",
    level:"중급",
    title:"출입문과 안전 동선 설계",
    project:"03 설계도 제작",
    path:"03-beginner-blueprint",
    goal:"출입문 위치와 폭을 입력받아 SVG에 표시하고 안전 동선 경고를 생성합니다.",
    tool:"generate_floor_plan",
    input:"doorSide, doorWidth",
    output:"door, evacuationPath, safetyWarnings",
    harness:"허용 방향, 최소 문 폭, SVG 표시와 경고 일치를 검증",
    tests:["정상 출입문이 SVG에 표시","문 폭이 기준 미만이면 경고","알 수 없는 방향은 설계 전에 차단"],
    prompt:`Next Stage MISSION-02를 수행해주세요.\n\n대상은 projects/03-beginner-blueprint입니다.\n먼저 기존 README, src/server.js, main.js, 테스트를 읽으세요.\n\n목표:\n- generate_floor_plan에 doorSide와 doorWidth 입력 추가\n- 허용 방향은 north, south, east, west\n- SVG에 출입문과 피난 동선 표시\n- safetyWarnings를 FE에 표시\n- Harness에서 방향·문 폭·SVG·경고 계약 검증\n\n작업 순서:\n1. 실패하는 학습자 테스트 3개를 먼저 작성하고 실행\n2. 도구 입력·출력 계약 구현\n3. FE 입력과 SVG 결과 연결\n4. Harness 미적용·적용·계약 위반 비교\n5. npm run verify 실행\n\n실제 건축 기준이라고 표현하지 말고 교육용 개념도라는 안내를 유지해주세요.`
  },
  {
    id:"MISSION-03",
    level:"고급",
    title:"신뢰도 기반 메모리 충돌 해결",
    project:"05 데이터 기반 메모리",
    path:"05-advanced-memory",
    goal:"같은 시각에 충돌하는 사건이 들어오면 출처 우선순위로 최신 기억을 결정하고 감사 근거를 남깁니다.",
    tool:"remember_events / recall_memory",
    input:"sourcePriority: verified | user | inferred",
    output:"winningEvent, rejectedEvents, resolutionReason",
    harness:"무근거 덮어쓰기, 우선순위 누락, 세션 간 기억 공유를 차단",
    tests:["같은 시각이면 검증된 출처 우선","탈락 사건도 타임라인에 유지","새 세션은 이전 기억과 격리"],
    prompt:`Next Stage MISSION-03을 수행해주세요.\n\n대상은 projects/05-advanced-memory입니다.\n먼저 기존 README, src/server.js, main.js, 테스트를 읽고 현재 충돌 정책을 설명하세요.\n\n목표:\n- 사건에 sourcePriority 추가: verified, user, inferred\n- eventTime이 같을 때 우선순위로 승자 결정\n- winningEvent, rejectedEvents, resolutionReason 반환\n- FE에서 선택된 기억과 탈락 근거를 함께 표시\n- Harness에서 무근거 덮어쓰기와 세션 오염 차단\n\n작업 순서:\n1. 실패하는 충돌·추적성·격리 테스트를 먼저 작성\n2. 결정 규칙을 작은 함수로 분리해 구현\n3. 타임라인과 FE 감사 화면 확장\n4. Harness 미적용·적용·계약 위반 비교\n5. npm run verify를 두 번 실행해 상태 오염 여부 확인\n\n탈락 사건을 삭제하지 말고 재현 가능한 결정 근거를 남겨주세요.`
  }
];

const grid = document.querySelector("#mission-grid");
const toast = document.querySelector("#copy-toast");

if (grid) {
  grid.innerHTML = missions.map((mission,index) => `
    <article class="mission-card" data-mission="${mission.id}">
      <header>
        <span class="mission-number">${String(index + 1).padStart(2,"0")}</span>
        <span class="mission-level">${mission.level}</span>
      </header>
      <p class="mission-source">${mission.project} 확장</p>
      <h3>${mission.title}</h3>
      <p class="mission-goal">${mission.goal}</p>
      <dl>
        <div><dt>MCP 도구</dt><dd>${mission.tool}</dd></div>
        <div><dt>새 입력</dt><dd>${mission.input}</dd></div>
        <div><dt>새 결과</dt><dd>${mission.output}</dd></div>
        <div><dt>Harness</dt><dd>${mission.harness}</dd></div>
      </dl>
      <details>
        <summary>필수 학습자 테스트</summary>
        <ol>${mission.tests.map((item) => `<li>${item}</li>`).join("")}</ol>
      </details>
      <div class="mission-actions">
        <button type="button" class="copy-mission" data-copy="${mission.id}">실습 프롬프트 복사</button>
        <a href="/projects/${mission.path}/">기준 데모 열기</a>
      </div>
    </article>`).join("");

  grid.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-copy]");
    if (!button) return;
    const mission = missions.find((item) => item.id === button.dataset.copy);
    if (!mission) return;
    try {
      await navigator.clipboard.writeText(mission.prompt);
      button.textContent = "복사 완료";
      toast.textContent = `${mission.id} 프롬프트를 복사했습니다. Claude Code 또는 Codex에 붙여넣으세요.`;
      toast.classList.add("is-visible");
      window.setTimeout(() => {
        button.textContent = "실습 프롬프트 복사";
        toast.classList.remove("is-visible");
      }, 2600);
    } catch {
      toast.textContent = "복사할 수 없습니다. 상세 가이드에서 프롬프트를 선택해주세요.";
      toast.classList.add("is-visible");
    }
  });
}
