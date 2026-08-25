import test from "node:test";
import assert from "node:assert/strict";
import { HarnessError, runExecutionHarness } from "../../../shared/harness/execution-harness.js";

const base={input:{transcript:"가상 회의"},required:["transcript"],allowedTools:["create_meeting_notes"],toolName:"create_meeting_notes",execute:async()=>({title:"회의",actionItems:[{owner:"민지"}]})};

test("Harness 적용: 검증과 실행 증거를 남긴다",async()=>{
  const result=await runExecutionHarness({...base,enabled:true,verify:()=>({ok:true,message:"계약 통과",metrics:{count:1}})});
  assert.equal(result.meta.status,"verified");
  assert.deepEqual(result.meta.checks,["preflight","tool-allowlist","postcondition","evidence"]);
  assert.match(result.meta.evidence.id,/^HARNESS-/);
});

test("Harness 미적용: 결과는 받지만 검증 증거가 없다",async()=>{
  const result=await runExecutionHarness({...base,enabled:false,verify:()=>({ok:false})});
  assert.equal(result.value.title,"회의");
  assert.equal(result.meta.status,"unverified");
  assert.equal(result.meta.evidence,undefined);
});

test("Harness 적용: 필수 입력 누락을 MCP 호출 전에 차단한다",async()=>{
  let called=false;
  await assert.rejects(()=>runExecutionHarness({...base,enabled:true,input:{transcript:""},execute:async()=>{called=true;return{}},verify:()=>({ok:true})}),(error)=>error instanceof HarnessError&&error.stage==="preflight");
  assert.equal(called,false);
});

test("Harness 적용: 허용되지 않은 도구를 정책 단계에서 차단한다",async()=>{
  await assert.rejects(()=>runExecutionHarness({...base,enabled:true,toolName:"delete_everything",verify:()=>({ok:true})}),(error)=>error instanceof HarnessError&&error.stage==="policy");
});

test("Harness 적용: 잘못된 출력 계약을 실패로 처리한다",async()=>{
  await assert.rejects(()=>runExecutionHarness({...base,enabled:true,verify:()=>({ok:false,message:"담당자 누락"})}),(error)=>error instanceof HarnessError&&error.stage==="postcondition"&&/담당자 누락/.test(error.message));
});
