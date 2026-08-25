export class HarnessError extends Error {
  constructor(stage, message, evidence = null) {
    super(message);
    this.name = "HarnessError";
    this.stage = stage;
    this.evidence = evidence;
  }
}

function isMissing(value) {
  return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
}

function blockEvidence(stage, details = {}) {
  return {
    id:`HARNESS-BLOCK-${Date.now().toString(36).toUpperCase()}`,
    decision:"BLOCK",
    assurance:stage === "execution" ? "FAILED" : "REJECTED",
    deliverable:false,
    stage,
    createdAt:new Date().toISOString(),
    ...details
  };
}

export async function runExecutionHarness({ enabled, input, required = [], allowedTools = [], toolName, execute, verify = () => ({ ok:true }) }) {
  const started = performance.now();
  const base = { mode:enabled ? "applied" : "bypassed", toolName, inputKeys:Object.keys(input ?? {}) };

  if (!enabled) {
    const value = await execute();
    return { value, meta:{
      ...base,
      status:"unverified",
      decision:"PASS_THROUGH",
      assurance:"UNVERIFIED",
      deliverable:true,
      durationMs:performance.now()-started,
      checks:[],
      outputKeys:Object.keys(value ?? {}),
      evidence:null
    } };
  }

  const missing = required.filter((key) => isMissing(input?.[key]));
  if (missing.length) throw new HarnessError("preflight", `Harness 사전검증 실패: ${missing.join(", ")} 입력이 필요합니다.`, blockEvidence("preflight", { toolCalled:false, missingFields:missing }));
  if (!allowedTools.includes(toolName)) throw new HarnessError("policy", `Harness 정책 차단: ${toolName} 도구는 허용 목록에 없습니다.`, blockEvidence("policy", { toolCalled:false, deniedTool:toolName }));

  let value;
  try {
    value = await execute();
  } catch (error) {
    throw new HarnessError("execution", `MCP 실행 실패: ${error.message}`, blockEvidence("execution", { toolCalled:true }));
  }
  const verification = await verify(value);
  if (!verification?.ok) throw new HarnessError("postcondition", `Harness 결과검증 실패: ${verification?.message ?? "결과 계약 불일치"}`, blockEvidence("postcondition", {
    toolCalled:true, outputKeys:Object.keys(value ?? {}), verification:verification?.message ?? "결과 계약 불일치"
  }));

  const evidence = {
    id:`HARNESS-${Date.now().toString(36).toUpperCase()}`,
    toolName,
    inputKeys:Object.keys(input ?? {}),
    outputKeys:Object.keys(value ?? {}),
    verification:verification.message ?? "결과 계약 통과",
    metrics:verification.metrics ?? {},
    createdAt:new Date().toISOString()
  };
  return { value, meta:{
    ...base,
    status:"verified",
    decision:"ALLOW",
    assurance:"VERIFIED",
    deliverable:true,
    durationMs:performance.now()-started,
    checks:["source-of-truth","input-contract","tool-allowlist","postcondition","trace-evidence"],
    evidence,
    outputKeys:evidence.outputKeys
  } };
}
