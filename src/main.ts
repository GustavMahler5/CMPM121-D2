import { CommandManager } from "./drawingcommands.ts";
import { Commands } from "./drawingcommands.ts";
import { ExportManager } from "./exportmanager.ts";
import { History } from "./history.ts";

const app = document.querySelector<HTMLElement>("#app")!;

const heading = document.createElement("h1");
heading.textContent = "Fun and Happy Drawing Canvas";

const message = document.createElement("p");
message.textContent = "Your drawings start here!";

app.append(heading, message);

const canvas: HTMLCanvasElement = document.createElement("canvas");
canvas.width = 512;
canvas.height = 512;
const ctx = canvas.getContext("2d");
canvas.className = "drawing-canvas";
app.append(canvas);

const bus = new EventTarget();
const commandList = new CommandManager();
const history = new History(commandList);
const exportManager = new ExportManager();
let currentCommand: Commands;

let currentColor = "#000000";

type StrokeTool = {
  name: string;
  toolType: "stroke";
  thickness: number;
  color?: string;
};
type StickerTool = {
  name: string;
  toolType: "sticker";
  content: string;
  color?: string;
};

type Tool = StrokeTool | StickerTool;

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
    name: "Eraser",
    toolType: "stroke",
    thickness: 5,
    color: "#ffffff",
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
  (tool) => tool.name === "Pen",
);

let previousTool: Tool | undefined = currentTool;

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
      color: currentTool.color || currentColor,
    };
  } else if (currentTool.toolType === "sticker") {
    currentCommand = {
      toolType: "sticker",
      position: { x: e.offsetX, y: e.offsetY },
      content: currentTool.content,
      color: currentTool.color || currentColor,
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

const functionContainer = document.createElement("div");
functionContainer.className = "button-container function-buttons";

const toolContainer = document.createElement("div");
toolContainer.className = "button-container tool-buttons";

const stickerContainer = document.createElement("div");
stickerContainer.className = "button-container sticker-buttons";

const stickerInputContainer = document.createElement("div");
stickerInputContainer.className = "sticker-input-container";

app.append(
  functionContainer,
  toolContainer,
  stickerContainer,
  stickerInputContainer,
);

function createButton(
  textContent: string,
  action: () => void,
  notification: string,
  container: HTMLElement = functionContainer,
): HTMLButtonElement {
  const button = document.createElement("button");
  button.textContent = textContent;

  button.addEventListener("click", () => {
    action();
    notify(notification);
  });

  container.append(button);
  return button;
}

function createToolButton(tool: Tool) {
  createButton(
    tool.name,
    () => {
      currentTool = tool;
      if (currentTool.name !== "Eraser") {
        previousTool = currentTool;
      }
    },
    "drawing-changed",
    tool.toolType === "sticker" ? stickerContainer : toolContainer,
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
const _exportButton = createButton(
  "Export",
  () => exportManager.exportPNG(canvas, heading, 2, commandList),
  "drawing-changed",
);

tools.forEach((tool) => {
  createToolButton(tool);
});

const toolNameInput = document.createElement("input");
toolNameInput.type = "text";
toolNameInput.placeholder = "Custom Sticker Name";

const toolContentInput = document.createElement("input");
toolContentInput.type = "text";
toolContentInput.placeholder = "Custom Sticker Content";

const toolColorInput = document.createElement("input");
toolColorInput.type = "color";
toolColorInput.value = currentColor;
toolColorInput.addEventListener("input", (e) => {
  currentColor = (e.target as HTMLInputElement).value;
  if (previousTool) {
    currentTool = previousTool;
  } else {
    const penTool = tools.find((tool) => tool.name === "Pen");
    if (penTool) currentTool = penTool;
  }
});

stickerInputContainer.append(
  toolNameInput,
  toolContentInput,
);

toolContainer.append(toolColorInput);

createButton(
  "Create Sticker",
  () => {
    if (
      toolNameInput.value.trim() !== "" &&
      toolContentInput.value.trim() !== ""
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
  stickerInputContainer,
);

function updateButtons(): void {
  undoButton.disabled = !history.canUndo();
  redoButton.disabled = !history.canRedo();
  clearButton.disabled = !history.canClear();
}

updateButtons();
