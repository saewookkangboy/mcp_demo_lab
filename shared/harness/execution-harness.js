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

export async function runExecutionHarness({ enabled, input, required = [], allowedTools = [], toolName, execute, verify = () => ({ ok:true }) }) {
  const started = performance.now();
  const base = { mode:enabled ? "applied" : "bypassed", toolName, inputKeys:Object.keys(input ?? {}) };

  if (!enabled) {
    const value = await execute();
    return { value, meta:{ ...base, status:"unverified", durationMs:performance.now()-started, checks:[], outputKeys:Object.keys(value ?? {}) } };
  }

  const missing = required.filter((key) => isMissing(input?.[key]));
  if (missing.length) throw new HarnessError("preflight", `Harness 사전검증 실패: ${missing.join(", ")} 입력이 필요합니다.`);
  if (!allowedTools.includes(toolName)) throw new HarnessError("policy", `Harness 정책 차단: ${toolName} 도구는 허용 목록에 없습니다.`);

  let value;
  try {
    value = await execute();
  } catch (error) {
    throw new HarnessError("execution", `MCP 실행 실패: ${error.message}`);
  }
  const verification = await verify(value);
  if (!verification?.ok) throw new HarnessError("postcondition", `Harness 결과검증 실패: ${verification?.message ?? "결과 계약 불일치"}`);

  const evidence = {
    id:`HARNESS-${Date.now().toString(36).toUpperCase()}`,
    toolName,
    inputKeys:Object.keys(input ?? {}),
    outputKeys:Object.keys(value ?? {}),
    verification:verification.message ?? "결과 계약 통과",
    metrics:verification.metrics ?? {},
    createdAt:new Date().toISOString()
  };
  return { value, meta:{ ...base, status:"verified", durationMs:performance.now()-started, checks:["preflight","tool-allowlist","postcondition","evidence"], evidence, outputKeys:evidence.outputKeys } };
}
