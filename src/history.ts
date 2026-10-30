import { CommandManager } from "./drawingcommands.ts";
import { Commands } from "./drawingcommands.ts";

type HistoryAction =
  | { type: "command"; command: Commands }
  | { type: "clear"; commands: Commands[] };

export class History {
  private undoList: HistoryAction[] = [];
  private redoList: HistoryAction[] = [];

  constructor(private commandManager: CommandManager) {
  }

  addCommand(command: Commands): void {
    this.commandManager.addCommand(command);
    this.undoList.push({ type: "command", command });
    this.clearRedoList();
  }

  getUndo(): HistoryAction[] {
    return this.undoList;
  }

  undo(): void {
    const currentCommand = this.undoList.pop();
    if (!currentCommand) return;

    if (currentCommand.type == "command") {
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

    if (currentCommand.type == "command") {
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

  canUndo(): boolean {
    return this.undoList.length > 0;
  }

  canRedo(): boolean {
    return this.redoList.length > 0;
  }

  canClear(): boolean {
    return this.commandManager.getLength() > 0;
  }
}
