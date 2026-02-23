import { render } from "ink";
import { ThemeProvider } from "./inc/ThemeProvider.js";
import { Board } from "./kanban/Board.js";

render(
  <ThemeProvider initial="dark">
    <Board />
  </ThemeProvider>,
);
