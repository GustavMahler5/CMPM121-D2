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

type Tool = StrokeTool | StickerTool;
type StrokeTool = {
  name: string;
  toolType: "stroke";
  thickness: number;
};
type StickerTool = {
  name: string;
  toolType: "sticker";
  content: string;
};

const tools: Tool[] = [
  {
    name: "Pen",
    toolType: "stroke",
    thickness: 1,
  },
  {
    name: "Marker",
    toolType: "stroke",
    thickness: 10,
  },
  {
    name: "Smile Sticker",
    toolType: "sticker",
    content: ":)",
  },
  {
    name: "Frown Sticker",
    toolType: "sticker",
    content: ":(",
  },
  {
    name: "Hi Sticker",
    toolType: "sticker",
    content: "hi",
  },
];

let currentTool: Tool | undefined = tools.find(
  (tool) => tool.name === "pen",
);

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
  if (currentTool == undefined) {
    return;
  }
  if (currentTool.toolType === "stroke") {
    cursor.active = true;
    currentCommand = {
      toolType: "stroke",
      point: [{ x: e.offsetX, y: e.offsetY }],
      thickness: currentTool.thickness,
    };
  } else if (currentTool.toolType === "sticker") {
    currentCommand = {
      toolType: "sticker",
      position: { x: e.offsetX, y: e.offsetY },
      content: currentTool.content,
    };
  }
  history.addCommand(currentCommand);
  notify("drawing-changed");
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.active) {
    if (currentCommand.toolType === "stroke") {
      currentCommand.point.push({ x: e.offsetX, y: e.offsetY });
      notify("drawing-changed");
    }
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

function createToolButton(tool: Tool) {
  createButton(
    tool.name,
    () => currentTool = tool,
    "drawing-changed",
  );
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

tools.forEach((tool) => {
  createToolButton(tool);
});

const toolNameInput = document.createElement("input");
toolNameInput.type = "text";
toolNameInput.placeholder = "Custom Sticker Name";
app.append(toolNameInput);

const toolContentInput = document.createElement("input");
toolContentInput.type = "text";
toolContentInput.placeholder = "Custom Sticker Content";
app.append(toolContentInput);

createButton(
  "Create Sticker",
  () => {
    if (
      !(toolNameInput.value.trim() === "") &&
      !(toolContentInput.value.trim() === "")
    ) {
      const customTool: StickerTool = {
        name: toolNameInput.value.trim(),
        toolType: "sticker",
        content: toolContentInput.value.trim(),
      };
      tools.push(customTool);
      createToolButton(customTool);
    }
  },
  "drawing-changed",
);

function updateButtons(): void {
  undoButton.disabled = !history.canUndo();
  redoButton.disabled = !history.canRedo();
  clearButton.disabled = !history.canClear();
}

updateButtons();

console.log("eof");
