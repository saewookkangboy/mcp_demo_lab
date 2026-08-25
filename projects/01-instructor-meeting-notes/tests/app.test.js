import test from "node:test";
import assert from "node:assert/strict";
import { generateMeetingNotes } from "../main.js";
import { createMeetingServer } from "../src/server.js";

test("학습자 관점: 원문을 넣으면 담당자와 실행 항목이 보인다",async()=>{
  const result=await generateMeetingNotes("민지님과 준호님이 출시 준비를 논의했습니다.");
  assert.deepEqual(result.attendees,["민지","준호"]);
  assert.ok(result.actionItems.every((item)=>item.owner&&item.task&&item.due));
});
test("검증 관점: 필수 원문이 없으면 이해 가능한 오류가 난다",async()=>{
  const server=createMeetingServer();
  await assert.rejects(()=>server.callTool("create_meeting_notes",{}),/필수 입력 누락: transcript/);
});
test("시연 관점: MCP 전체 흐름이 순서대로 추적된다",async()=>{
  const trace=[];
  await generateMeetingNotes("민지님이 회의를 진행했습니다.",(event)=>trace.push(event));
  assert.deepEqual(trace.map((event)=>event.operation),["initialize","tools/list","tools/call","tool/result"]);
  assert.equal(trace[2].request.params.name,"create_meeting_notes");
});
test("오류 시연 관점: 잘못된 입력이 빨간 오류 단계에 전달된다",async()=>{
  const trace=[];
  await assert.rejects(()=>generateMeetingNotes("",(event)=>trace.push(event)),/필수 입력 누락/);
  assert.equal(trace.at(-1).operation,"tool/error");
  assert.equal(trace.at(-1).status,"error");
});
