const ENDPOINT = "https://modelcontextprotocol.io/mcp";
const PROTOCOL_VERSION = "2025-06-18";

export function parseSseMessage(text) {
  const messages = text.split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => JSON.parse(line.slice(5).trim()));
  if (!messages.length) throw new Error("원격 MCP 응답에 data 이벤트가 없습니다.");
  const message = messages.at(-1);
  if (message.error) throw new Error(message.error.message ?? "원격 MCP 오류");
  return message.result;
}

async function callMcp(method, params, id) {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "accept": "application/json, text/event-stream",
      "content-type": "application/json",
      "mcp-protocol-version": PROTOCOL_VERSION
    },
    body: JSON.stringify({ jsonrpc:"2.0", id, method, params }),
    signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) throw new Error(`원격 MCP HTTP ${response.status}`);
  return parseSseMessage(await response.text());
}

export async function searchOfficialMcpDocs(query) {
  const initialize = await callMcp("initialize", {
    protocolVersion: PROTOCOL_VERSION,
    capabilities: {},
    clientInfo: { name:"mcp-demo-lab", version:"1.0.0" }
  }, 1);
  const listed = await callMcp("tools/list", {}, 2);
  const called = await callMcp("tools/call", {
    name: "search_model_context_protocol",
    arguments: { query }
  }, 3);
  return {
    endpoint: ENDPOINT,
    transport: "Streamable HTTP (SSE response)",
    protocolVersion: initialize.protocolVersion,
    serverInfo: initialize.serverInfo,
    tools: listed.tools.map(({ name, title, description, annotations }) => ({ name, title, description, annotations })),
    selectedTool: "search_model_context_protocol",
    content: called.content.filter((item) => item.type === "text").slice(0, 3).map((item) => item.text.slice(0, 5000))
  };
}
