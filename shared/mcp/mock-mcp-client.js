/** 실제 MCP Client처럼 초기화한 뒤 도구를 탐색하고 호출한다. */
export function createMockMcpClient(server, { onTrace = () => {} } = {}) {
  let initialized = false;
  let serverInfo;

  const trace = (operation, status, detail = {}) => onTrace({
    operation, status, at: new Date().toISOString(), ...detail
  });

  return {
    async connect() {
      const started = performance.now();
      try {
        const result = await server.initialize();
        initialized = true;
        serverInfo = result.serverInfo;
        trace("initialize", "success", { request: { method: "initialize" }, response: result, durationMs: performance.now() - started });
        return result;
      } catch (error) {
        trace("initialize", "error", { error: error.message, durationMs: performance.now() - started });
        throw error;
      }
    },
    async listTools() {
      if (!initialized) throw new Error("먼저 client.connect()를 호출하세요.");
      const started = performance.now();
      const tools = await server.listTools();
      trace("tools/list", "success", { request: { method: "tools/list" }, response: { tools }, durationMs: performance.now() - started });
      return tools;
    },
    async callTool(name, args) {
      if (!initialized) throw new Error("먼저 client.connect()를 호출하세요.");
      const request = { method: "tools/call", params: { name, arguments: args } };
      trace("tools/call", "success", { request });
      const started = performance.now();
      try {
        const result = await server.callTool(name, args);
        if (result.isError) throw new Error(result.content?.[0]?.text ?? "도구 호출 실패");
        const value = result.content[0].json;
        trace("tool/result", "success", { response: value, durationMs: performance.now() - started });
        return value;
      } catch (error) {
        trace("tool/error", "error", { request, error: error.message, durationMs: performance.now() - started });
        throw error;
      }
    },
    getServerInfo() { return serverInfo; }
  };
}
