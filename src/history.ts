import { CommandManager } from "./drawingcommands.ts";
import { Commands } from "./drawingcommands.ts";

type HistoryAction =
  | { type: "stroke"; command: Commands }
  | { type: "clear"; commands: Commands[] };

export class History {
  private undoList: HistoryAction[] = [];
  private redoList: HistoryAction[] = [];

  constructor(private commandManager: CommandManager) {
  }

  addStroke(command: Commands): void {
    this.commandManager.addCommand(command);
    this.undoList.push({ type: "stroke", command });
    this.clearRedoList();
  }

  undo(): void {
    const currentCommand = this.undoList.pop();
    if (!currentCommand) return;

    if (currentCommand.type == "stroke") {
      this.commandManager.removeLastCommand();
    } else if (currentCommand.type == "clear") {
      for (const command of currentCommand.commands) {
        this.commandManager.addCommand(command);
      }
    }

    this.redoList.push(currentCommand);
  }

  redo(): void {
    const currentCommand = this.redoList.pop();
    if (!currentCommand) return;

    if (currentCommand.type == "stroke") {
      this.commandManager.addCommand(currentCommand.command);
    } else if (currentCommand.type == "clear") {
      this.commandManager.removeAllCommands();
    }

    this.undoList.push(currentCommand);
  }

  clearAll(): void {
    if (this.commandManager.getLength() < 1) return;

    const commands = this.commandManager.removeAllCommands();

    this.undoList.push({ type: "clear", commands });
    this.clearRedoList();
  }

  clearRedoList(): void {
    this.redoList = [];
  }
}
