import { DrawingInterface, Plugin, PluginInterface } from "./plugin";

interface Coord {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
}

class HighlighterPlugin extends Plugin {
  coord: Coord = { x: 0, y: 0, oldX: 0, oldY: 0 };
  midCoord: Coord = { x: 0, y: 0, oldX: 0, oldY: 0 };
  screenCanvas?: HTMLCanvasElement;
  snapshotImage?: ImageData;

  constructor(initialValues?: Partial<PluginInterface>) {
    super({
      ...initialValues,
      name: "highlighter",
    });
  }

  draw(data: DrawingInterface) {
    super.draw(data);

    const { x, y, width, height, scale, lineWidth, color, state, handleEvent } =
      data;
    if (!this.screenCanvas) {
      this.screenCanvas = this.canvas?.cloneNode() as HTMLCanvasElement;
      this.screenCanvas.width = width * scale;
      this.screenCanvas.height = height * scale;
      this.screenCanvas.getContext("2d")?.scale(scale, scale);
    }
    const screenContext = this.screenCanvas.getContext("2d");
    const originalContext = this.canvas?.getContext("2d");
    if (!screenContext || !originalContext) return;

    originalContext.globalAlpha = 0.5;

    screenContext.lineCap = "square";
    screenContext.lineWidth = lineWidth;
    screenContext.strokeStyle = color;

    this.coord.x = x;
    this.coord.y = y;
    this.coord.oldX = this.coord.oldX || x;
    this.coord.oldY = this.coord.oldY || y;

    this.midCoord.x = (this.coord.oldX + this.coord.x) >> 1;
    this.midCoord.y = (this.coord.oldY + this.coord.y) >> 1;
    this.midCoord.oldX = this.midCoord.oldX || x;
    this.midCoord.oldY = this.midCoord.oldY || y;

    if (state === "draw-started" || state === "drawing") {
      if (state === "draw-started") {
        this.snapshotImage = originalContext.getImageData(
          0,
          0,
          width * scale,
          height * scale
        );
      }

      screenContext.beginPath();
      screenContext.moveTo(this.midCoord.x, this.midCoord.y);
      screenContext.quadraticCurveTo(
        this.coord.oldX,
        this.coord.oldY,
        this.midCoord.oldX,
        this.midCoord.oldY
      );
      screenContext.stroke();
      screenContext.closePath();

      this.coord.oldX = this.coord.x;
      this.coord.oldY = this.coord.y;
      this.midCoord.oldX = this.midCoord.x;
      this.midCoord.oldY = this.midCoord.y;

      originalContext.clearRect(0, 0, width * scale, height * scale);
      originalContext.putImageData(this.snapshotImage!, 0, 0);
      originalContext.drawImage(this.screenCanvas, 0, 0, width, height);
    } else if (state === "draw-finished") {
      this.coord = { x: 0, y: 0, oldX: 0, oldY: 0 };
      this.midCoord = { x: 0, y: 0, oldX: 0, oldY: 0 };

      delete this.screenCanvas;
      this.screenCanvas = undefined;
    }

    handleEvent?.({
      command: this.name,
      x,
      y,
      lineWidth,
      color,
      state,
    });
  }
}

export default HighlighterPlugin;
