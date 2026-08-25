import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { searchOfficialMcpDocs } from "../shared/server/official-docs-mcp.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const mime = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8", ".json":"application/json; charset=utf-8" };
async function readJsonBody(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 8192) throw new Error("요청이 너무 큽니다.");
  }
  return JSON.parse(body || "{}");
}

const server = createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (pathname === "/favicon.ico") { res.writeHead(204); res.end(); return; }
    if (pathname === "/api/oss-mcp/docs-search") {
      if (req.method !== "POST") { res.writeHead(405); res.end("Method not allowed"); return; }
      const { query } = await readJsonBody(req);
      if (typeof query !== "string" || query.trim().length < 2 || query.length > 200) {
        res.writeHead(400, { "content-type":"application/json; charset=utf-8" });
        res.end(JSON.stringify({ error:"질문은 2자 이상 200자 이하로 입력하세요." }));
        return;
      }
      const data = await searchOfficialMcpDocs(query.trim());
      res.writeHead(200, { "content-type":"application/json; charset=utf-8", "cache-control":"no-store" });
      res.end(JSON.stringify(data));
      return;
    }
    const safe = normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, "");
    let file = join(root, safe);
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    res.writeHead(200, { "content-type": mime[extname(file)] ?? "application/octet-stream" });
    res.end(await readFile(file));
  } catch (error) {
    if (req.url?.startsWith("/api/")) {
      res.writeHead(502, { "content-type":"application/json; charset=utf-8" });
      res.end(JSON.stringify({ error:error.message ?? "외부 MCP 연결 실패" }));
      return;
    }
    res.writeHead(404); res.end("Not found");
  }
});
const port = Number(process.env.PORT ?? 4173);
server.listen(port, () => console.log(`MCP Demo Lab: http://localhost:${port}`));
