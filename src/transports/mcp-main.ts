import { createKanbanApi } from "../domain/index.js";
import { createMcpServer } from "./mcp.js";

const { router } = createKanbanApi();
const server = createMcpServer(router, { name: "unikanban-mcp", version: "0.1.0" });
server.start();
