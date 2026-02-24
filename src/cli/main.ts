import { createKanbanApi } from "../domain/index.js";
import { createCli } from "./index.js";

const { router } = createKanbanApi();
const cli = createCli(router);
cli.parse();
