import { CommandManager } from "./drawingcommands.ts";
import { Commands } from "./drawingcommands.ts";

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

const cursor = { active: false, x: 0, y: 0 };

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  currentCommand = { point: [{ x: e.offsetX, y: e.offsetY }] };
  commandList.addCommand(currentCommand);
  notify("drawing-changed");
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
  notify("cursor-changed");
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.active) {
    currentCommand.point.push({ x: e.offsetX, y: e.offsetY });
    notify("drawing-changed");
  }
});

canvas.addEventListener("mouseout", () => {
  cursor.active = false;
  notify("cursor-changed");
});

console.log("eof");
