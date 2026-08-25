import test from"node:test";import assert from"node:assert/strict";import{searchKnowledge}from"../main.js";
test("학습자 관점: 답변에 검색 근거 문서가 따라온다",async()=>{const r=await searchKnowledge("재택근무 승인 규칙은?");assert.match(r.answer,/주 2회/);assert.equal(r.citations[0].id,"DOC-101")});
test("대화 관점: 후속 질문은 이전 질문의 키워드를 활용한다",async()=>{const history=[{role:"user",content:"재택근무 규정 알려줘"},{role:"assistant",content:"관련 규정을 찾았습니다."}];const r=await searchKnowledge("승인은 언제 받아요?",history);assert.match(r.answer,/전날/);assert.equal(r.usedHistory,2)});
test("신뢰 관점: 근거가 없으면 문서 ID를 꾸며내지 않는다",async()=>{const r=await searchKnowledge("구내식당 메뉴는?");assert.equal(r.citations.length,0);assert.match(r.answer,/찾지 못했습니다/)});
