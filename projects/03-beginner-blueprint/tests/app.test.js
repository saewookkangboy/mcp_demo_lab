import test from"node:test";import assert from"node:assert/strict";import{generateFloorPlan}from"../main.js";
test("학습자 관점: 8m × 6m 교육장의 면적과 SVG를 받는다",async()=>{const plan=await generateFloorPlan({width:8,height:6,purpose:"교육장"});assert.equal(plan.area,48);assert.match(plan.svg,/<svg/);assert.match(plan.svg,/교육장/);assert.equal(plan.deskCount,12)});
test("경계값 관점: 작은 공간에는 동선 경고가 붙는다",async()=>{const plan=await generateFloorPlan({width:3,height:4,purpose:"회의실"});assert.equal(plan.warnings.length,1)});
test("검증 관점: 2m 미만 치수는 거부한다",async()=>{await assert.rejects(()=>generateFloorPlan({width:1,height:6,purpose:"교육장"}),/2m 이상/)});
