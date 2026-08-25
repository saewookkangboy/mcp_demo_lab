import test from"node:test";import assert from"node:assert/strict";import{calculateQuote}from"../main.js";
test("학습자 관점: 공급가, 세금, 합계가 같은 규칙으로 계산된다",async()=>{const q=await calculateQuote({service:"웹사이트 진단",quantity:2});assert.equal(q.subtotal,300000);assert.equal(q.tax,30000);assert.equal(q.total,330000)});
test("검증 관점: 0 이하 수량은 견적을 만들지 않는다",async()=>{await assert.rejects(()=>calculateQuote({service:"AI 워크숍",quantity:0}),/1 이상/)});
