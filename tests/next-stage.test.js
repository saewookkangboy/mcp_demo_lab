import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFile(new URL(path, `file://${root}/`), "utf8");

test("Next Stage 관점: 기본 실습 뒤에 커스텀 미션 3개를 제공한다", async () => {
  const [html, script] = await Promise.all([read("next-stage.html"), read("shared/ui/next-stage.js")]);
  assert.match(html, /Next Stage/);
  assert.match(html, /7단계 완주 흐름/);
  assert.equal((script.match(/id:"MISSION-0[1-3]"/g) ?? []).length, 3);
});

test("학습자 관점: 모든 커스텀 미션은 테스트·FE·Harness·전체 검증을 포함한다", async () => {
  const script = await read("shared/ui/next-stage.js");
  for (const phrase of ["실패하는 학습자 테스트", "FE", "Harness 미적용·적용·계약 위반 비교", "npm run verify"]) {
    assert.match(script, new RegExp(phrase));
  }
  assert.equal((script.match(/tests:\[/g) ?? []).length, 3);
});

test("완주 관점: 마지막 기본 데모에서 Next Stage로 이동할 수 있다", async () => {
  const [html, studio, home] = await Promise.all([read("presentation.html"), read("shared/ui/presentation-studio.js"), read("index.html")]);
  assert.match(html, /href="\/next-stage\.html"/);
  assert.match(studio, /nextStage\.hidden = current !== demos\.length - 1/);
  assert.match(home, /Next Stage/);
});
