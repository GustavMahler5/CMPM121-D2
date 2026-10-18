export type Point = {
  x: number;
  y: number;
};

export type Commands = {
  point: Point[];
};

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
  execute(): void {
    return;
  }
  executeAll(ctx: CanvasRenderingContext2D): void {
    for (const command of this.commandList) {
      ctx.beginPath();
      const firstPoint: Point = command.point[0];
      ctx.moveTo(firstPoint.x, firstPoint.y);

      for (const point of command.point) {
        ctx.lineTo(point.x, point.y);
      }

      ctx.stroke();
    }
  }
}
