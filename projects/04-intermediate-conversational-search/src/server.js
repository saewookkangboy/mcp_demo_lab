import { createMockMcpServer } from "../../../shared/mcp/mock-mcp-server.js";

const documents=[
 {id:"DOC-101",title:"재택근무 운영 정책",text:"재택근무는 주 2회 가능하며 전날 팀장 승인이 필요합니다.",tags:["인사","근무"]},
 {id:"DOC-202",title:"법인카드 사용 지침",text:"5만원 이상 결제에는 영수증과 사용 목적을 등록해야 합니다.",tags:["재무","카드"]},
 {id:"DOC-303",title:"정보보안 체크리스트",text:"외부 공유 링크는 7일 이내 만료하고 민감정보를 포함하지 않습니다.",tags:["보안","공유"]}
];
const terms={재택근무:["재택근무","근무","승인"],카드:["카드","결제","영수증"],공유:["공유","링크","보안"],보안:["보안","민감정보","링크"]};
export function createSearchServer(){return createMockMcpServer({name:"knowledge-search-mcp",tools:[{
 name:"search_knowledge",description:"가상 사내 문서를 검색하고 근거와 함께 답합니다.",inputSchema:{type:"object",properties:{query:{type:"string"},history:{type:"array"}},required:["query"]},required:["query"],
 run:({query,history=[]})=>{const context=[...history.map(x=>x.content),query].join(" ");const keywords=[...new Set(Object.entries(terms).filter(([key])=>context.includes(key)).flatMap(([,values])=>values))];const scored=documents.map(doc=>({doc,score:keywords.filter(k=>(doc.title+doc.text+doc.tags.join(" ")).includes(k)).length})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);if(!scored.length)return{answer:"관련 문서를 찾지 못했습니다. 질문에 '재택근무', '카드', '보안' 같은 구체적인 단어를 넣어 주세요.",citations:[],query,usedHistory:history.length};const best=scored[0].doc;return{answer:`${best.text} 자세한 예외는 담당 부서에 확인하세요.`,citations:scored.slice(0,2).map(({doc,score})=>({id:doc.id,title:doc.title,score})),query,usedHistory:history.length};}
}]})}
