import { CommandManager } from "./drawingcommands.ts";
import { Commands } from "./drawingcommands.ts";
import { History } from "./history.ts";

const app = document.querySelector<HTMLElement>("#app")!;

const heading = document.createElement("h1");
heading.textContent = "D2 project";

const message = document.createElement("p");
message.textContent = "Your project starts here.";

app.append(heading, message);

const canvas: HTMLCanvasElement = document.createElement("canvas");
canvas.width = 512;
canvas.height = 512;
const ctx = canvas.getContext("2d");
canvas.style.border = "2px solid black";
app.append(canvas);

const bus = new EventTarget();
const commandList = new CommandManager();
const history = new History(commandList);
let currentCommand: Commands;

function draw() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  commandList.executeAll(ctx);
}

function notify(name: string): void {
  bus.dispatchEvent(new Event(name));
}

bus.addEventListener("drawing-changed", draw);
bus.addEventListener("drawing-changed", updateButtons);

const cursor = { active: false, x: 0, y: 0 };

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  currentCommand = { point: [{ x: e.offsetX, y: e.offsetY }] };
  history.addStroke(currentCommand);
  notify("drawing-changed");
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.active) {
    currentCommand.point.push({ x: e.offsetX, y: e.offsetY });
    notify("drawing-changed");
  }
});

canvas.addEventListener("mouseout", () => {
  cursor.active = false;
});

const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
app.append(undoButton);

const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
app.append(redoButton);

const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
app.append(clearButton);

undoButton.addEventListener("click", () => {
  history.undo();
  notify("drawing-changed");
});

redoButton.addEventListener("click", () => {
  history.redo();
  notify("drawing-changed");
});

clearButton.addEventListener("click", () => {
  history.clearAll();
  notify("drawing-changed");
});

function updateButtons(): void {
  undoButton.disabled = !history.canUndo();
  redoButton.disabled = !history.canRedo();
  clearButton.disabled = !history.canClear();
}

updateButtons();

console.log("eof");
