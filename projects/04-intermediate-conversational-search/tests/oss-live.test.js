import test from "node:test";
import assert from "node:assert/strict";
import { parseSseMessage } from "../../../shared/server/official-docs-mcp.mjs";

test("실제 MCP 계약: SSE data 이벤트에서 JSON-RPC result를 읽는다",()=>{
  const result=parseSseMessage('event: message\ndata: {"jsonrpc":"2.0","id":1,"result":{"tools":[{"name":"search_docs"}]}}\n');
  assert.equal(result.tools[0].name,"search_docs");
});

test("실제 MCP 계약: 원격 오류를 조용히 성공으로 처리하지 않는다",()=>{
  assert.throws(()=>parseSseMessage('data: {"jsonrpc":"2.0","id":1,"error":{"message":"invalid query"}}\n'),/invalid query/);
});
