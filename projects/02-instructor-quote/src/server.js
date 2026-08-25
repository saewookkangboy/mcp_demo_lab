import { createMockMcpServer } from "../../../shared/mcp/mock-mcp-server.js";

export function createQuoteServer(){return createMockMcpServer({name:"quote-mcp",tools:[{
  name:"calculate_quote",description:"서비스와 수량을 기반으로 가상 견적을 계산합니다.",inputSchema:{type:"object",properties:{service:{type:"string"},quantity:{type:"number"}},required:["service","quantity"]},required:["service","quantity"],
  run:({service,quantity})=>{if(!Number.isFinite(Number(quantity))||Number(quantity)<=0)throw new Error("수량은 1 이상이어야 합니다.");const unitPrices={"웹사이트 진단":150000,"콘텐츠 제작":220000,"AI 워크숍":800000};const unitPrice=unitPrices[service]??100000;const subtotal=unitPrice*Number(quantity);const tax=Math.round(subtotal*.1);return{quoteId:"Q-2026-0825",service,quantity:Number(quantity),unitPrice,subtotal,tax,total:subtotal+tax,currency:"KRW",validUntil:"2026-09-08"};}
}]})}
