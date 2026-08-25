import { createMockMcpServer } from "../../../shared/mcp/mock-mcp-server.js";

export function createMeetingServer() {
  return createMockMcpServer({ name:"meeting-notes-mcp", tools:[{
    name:"create_meeting_notes", description:"대화 원문을 구조화된 회의록으로 변환합니다.",
    inputSchema:{ type:"object", properties:{ transcript:{type:"string"} }, required:["transcript"] }, required:["transcript"],
    run:({transcript}) => {
      const people = [...new Set([...transcript.matchAll(/([가-힣]{2,4})님/g)].map((m)=>m[1]))];
      return {
        title:"신제품 출시 준비 회의", date:"2026-08-25", attendees:people.length?people:["민지","준호","서연"],
        summary:"출시 일정과 고객 안내 자료의 담당자 및 마감일을 확정했습니다.",
        decisions:["베타 공개일을 9월 15일로 확정","고객 안내 메일은 공개 3일 전에 발송"],
        actionItems:[{owner:"민지",task:"FAQ 초안 작성",due:"2026-09-05"},{owner:"준호",task:"베타 환경 점검",due:"2026-09-08"}],
        sourceLength:transcript.length
      };
    }
  }]});
}
