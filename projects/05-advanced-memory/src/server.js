import { createMockMcpServer } from "../../../shared/mcp/mock-mcp-server.js";

export function createMemoryServer(){
  const events=[];
  const current=new Map();
  const apply=(event)=>{const key=`${event.subject}:${event.field}`;const before=current.get(key);if(!before||new Date(event.at)>=new Date(before.at))current.set(key,event);return{accepted:!before||new Date(event.at)>=new Date(before.at),previous:before?.value??null}};
  return createMockMcpServer({name:"event-memory-mcp",tools:[
    {name:"remember_events",description:"시간이 포함된 사건을 메모리에 반영합니다.",inputSchema:{type:"object",properties:{events:{type:"array"}},required:["events"]},required:["events"],run:({events:incoming})=>{if(!Array.isArray(incoming))throw new Error("events는 배열이어야 합니다.");const results=incoming.map((event,index)=>{for(const key of["subject","field","value","at","source"]){if(!event[key])throw new Error(`events[${index}].${key} 누락`)}const duplicate=events.some((item)=>["subject","field","value","at","source"].every((key)=>item[key]===event[key]));if(!duplicate)events.push({...event});return{...event,duplicate,...apply(event)}});return{received:incoming.length,accepted:results.filter(x=>x.accepted).length,results,memorySize:current.size}}},
    {name:"recall_memory",description:"주제별 최신 기억과 근거를 조회합니다.",inputSchema:{type:"object",properties:{subject:{type:"string"}},required:["subject"]},required:["subject"],run:({subject})=>{const memories=[...current.values()].filter(x=>x.subject===subject).sort((a,b)=>a.field.localeCompare(b.field));return{subject,memories,answer:memories.length?memories.map(x=>`${x.field}: ${x.value}`).join(", "):"기억된 데이터가 없습니다.",evidenceCount:events.filter(x=>x.subject===subject).length}}},
    {name:"inspect_timeline",description:"주제의 전체 사건 이력을 시간순으로 조회합니다.",inputSchema:{type:"object",properties:{subject:{type:"string"}},required:["subject"]},required:["subject"],run:({subject})=>({subject,events:events.filter(x=>x.subject===subject).sort((a,b)=>new Date(a.at)-new Date(b.at))})}
  ]});
}
