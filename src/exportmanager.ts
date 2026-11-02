import { CommandManager } from "./drawingcommands.ts";

export class ExportManager {
  public exportPNG(
    canvas: HTMLCanvasElement,
    heading: HTMLHeadingElement,
    imgRatio: number,
    commandList: CommandManager,
  ) {
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
}
