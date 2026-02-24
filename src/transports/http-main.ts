import { createKanbanApi } from "../domain/index.js";
import { createHttpServer } from "./http.js";

const port = parseInt(process.env.PORT ?? "3100", 10);
const { router } = createKanbanApi();
const httpServer = createHttpServer(router, { port });

httpServer.start().then(() => {
  console.log(`UniKanban HTTP server listening at ${httpServer.address}`);
  console.log(`  Describe: GET ${httpServer.address}${httpServer.basePath}/describe`);
  console.log(`  Call:     POST ${httpServer.address}${httpServer.basePath}/call/<procedure>`);
});
