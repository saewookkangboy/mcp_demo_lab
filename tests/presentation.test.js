import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFile(new URL(path, `file://${root}/`), "utf8");

test("학습자 관점: 전체 시연은 한 화면에서 5개 데모를 제공한다", async () => {
  const [html, script] = await Promise.all([read("presentation.html"), read("shared/ui/presentation-studio.js")]);
  assert.match(html, /전체 시연/);
  assert.match(html, /demo-frame/);
  assert.equal((script.match(/path:"\d{2}-/g) ?? []).length, 5);
});

test("강사 관점: 터미널 없이 기본 실행과 화면 검증을 제어한다", async () => {
  const [html, inspector] = await Promise.all([read("presentation.html"), read("shared/ui/mcp-inspector.js")]);
  assert.match(html, /기본 입력 실행/);
  assert.match(html, /화면 검증/);
  assert.match(inspector, /mcp-demo:run-screen-check/);
  assert.doesNotMatch(inspector, /node --test|명령 복사/);
});

test("비교 관점: 전체 시연 Harness 토글이 개별 데모에 전달된다", async () => {
  const [studio, harness] = await Promise.all([read("shared/ui/presentation-studio.js"), read("shared/ui/harness-controller.js")]);
  assert.match(studio, /mcp-demo:harness/);
  assert.match(harness, /mcp-demo:harness/);
  assert.match(studio, /Harness 미적용/);
});

test("Harness Engineering 관점: 최종 전달 결정값이 적용 전후로 구분된다", async () => {
  const [controller, harness] = await Promise.all([read("shared/ui/harness-controller.js"), read("shared/harness/execution-harness.js")]);
  assert.match(controller, /최종 전달값/);
  assert.match(controller, /계약 위반 결과 비교/);
  assert.match(harness, /decision:"PASS_THROUGH"/);
  assert.match(harness, /decision:"ALLOW"/);
  assert.match(harness, /decision:"BLOCK"/);
});

test("외부 MCP 관점: 설치 명령 대신 화면 연결 시연을 제공한다", async () => {
  const extension = await read("shared/ui/oss-extension.js");
  assert.match(extension, /화면 연결 시연/);
  assert.match(extension, /connection-stages/);
  assert.doesNotMatch(extension, /npx -y|uvx mcp-server/);
});
