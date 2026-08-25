/** 교육용 MCP Server 대역. 네트워크 없이 tools/list와 tools/call 흐름을 재현한다. */
export function createMockMcpServer({ name, tools }) {
  const toolMap = new Map(tools.map((tool) => [tool.name, tool]));

  return {
    async initialize() {
      return { protocolVersion: "2025-06-18", serverInfo: { name, version: "1.0.0" } };
    },
    async listTools() {
      return tools.map(({ name, description, inputSchema }) => ({ name, description, inputSchema }));
    },
    async callTool(name, args = {}) {
      const tool = toolMap.get(name);
      if (!tool) throw new Error(`알 수 없는 도구: ${name}`);
      const missing = (tool.required ?? []).filter((key) => args[key] === undefined || args[key] === "");
      if (missing.length) throw new Error(`필수 입력 누락: ${missing.join(", ")}`);
      return { content: [{ type: "json", json: await tool.run(args) }], isError: false };
    }
  };
}
