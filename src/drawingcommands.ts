export type Point = {
  x: number;
  y: number;
};

export type Stroke = {
  toolType: "stroke";
  point: Point[];
  thickness: number;
};

export type Sticker = {
  toolType: "sticker";
  position: Point;
  content: string;
};

export type Commands = Stroke | Sticker;

export class CommandManager {
  constructor() {
  }

  private commandList: Commands[] = [];

  addCommand(command: Commands): void {
    this.commandList.push(command);
  }

  getCommands(): Commands[] {
    return this.commandList;
  }

  removeLastCommand(): Commands | undefined {
    return this.commandList.pop();
  }

  removeAllCommands(): Commands[] {
    const returnList: Commands[] = [];
    while (this.getLength() > 0) {
      const currentCommand = this.removeLastCommand();
      if (currentCommand) returnList.push(currentCommand);
    }
    return returnList.reverse();
  }

  getLength(): number {
    return this.commandList.length;
  }

  executeAll(ctx: CanvasRenderingContext2D): void {
    for (const command of this.commandList) {
      if (command.toolType === "stroke") {
        ctx.lineWidth = command.thickness;
        ctx.beginPath();
        const firstPoint: Point = command.point[0];
        ctx.moveTo(firstPoint.x, firstPoint.y);

        for (const point of command.point) {
          ctx.lineTo(point.x, point.y);
        }

        ctx.stroke();
      } else if (command.toolType === "sticker") {
        ctx.fillText(command.content, command.position.x, command.position.y);
      }
    }
  }
}
