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

function createButton(
  textContent: string,
  action: () => void,
  notification: string,
): HTMLButtonElement {
  const button = document.createElement("button");
  button.textContent = textContent;
  button.addEventListener("click", () => {
    action();
    notify(notification);
  });
  app.append(button);
  return button;
}

const undoButton = createButton(
  "Undo",
  () => history.undo(),
  "drawing-changed",
);
const redoButton = createButton(
  "Redo",
  () => history.redo(),
  "drawing-changed",
);
const clearButton = createButton(
  "Clear",
  () => history.clearAll(),
  "drawing-changed",
);
const exportButton = createButton(
  "Export",
  () => exportPNG(2),
  "drawing-changed",
);

function updateButtons(): void {
  undoButton.disabled = !history.canUndo();
  redoButton.disabled = !history.canRedo();
  clearButton.disabled = !history.canClear();
}

app.append(exportButton);

function exportPNG(imgRatio: number) {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = canvas.width * imgRatio;
  exportCanvas.height = canvas.height * imgRatio;

  const imgExport = exportCanvas.getContext("2d")!;
  imgExport.fillStyle = "#ffffffff";
  imgExport.fillRect(0, 0, exportCanvas.width, exportCanvas.height); // sets bg to white
  imgExport.scale(imgRatio, imgRatio);

  commandList.executeAll(imgExport); // draws from stack of strokes

  const downloadLink = document.createElement("a"); // creates an invisible link in memory
  downloadLink.href = exportCanvas.toDataURL("image/png"); // sets the data to a png of the canvas
  downloadLink.download = `${heading.textContent}.png`; // sets the name of it to the heading
  downloadLink.click(); // clicks ont the memory prompting the download
}

updateButtons();

console.log("eof");
