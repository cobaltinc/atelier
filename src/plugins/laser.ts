import {
  DrawingInterface,
  DrawingState,
  Plugin,
  PluginInterface,
} from "./plugin";

class LaserPlugin extends Plugin {
  snapshotImage?: ImageData;

  constructor(initialValues?: Partial<PluginInterface>) {
    super({
      ...initialValues,
      name: "laser",
    });
  }

  draw(data: DrawingInterface) {
    super.draw(data);

    const { x, y, lineWidth, color, width, height, scale, state, handleEvent } =
      data;
    const context = this.canvas?.getContext("2d");
    if (!context) return;

    context.lineWidth = 6;
    context.strokeStyle = "#e04444";
    context.fillStyle = "#e04444";
    context.shadowColor = "#ff0000";
    context.shadowBlur = 10;

    if (state === "draw-started") {
      this.snapshotImage = context.getImageData(
        0,
        0,
        width * scale,
        height * scale
      );
    } else if (state === "drawing") {
      if (!this.snapshotImage) return;

      context.clearRect(0, 0, width * scale, height * scale);
      context.putImageData(this.snapshotImage!, 0, 0);

      context.beginPath();
      context.arc(x, y, 6, 0, Math.PI * 2);
      context.stroke();
      context.fill();
      context.closePath();
    } else if (state === "draw-finished") {
      context.clearRect(0, 0, width * scale, height * scale);
      context.putImageData(this.snapshotImage!, 0, 0);
      this.snapshotImage = undefined;
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

export default LaserPlugin;
