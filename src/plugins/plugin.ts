interface PluginInterface {
  name: string;
  debug: boolean;
  canvas?: HTMLCanvasElement;
}

type DrawingState = "draw-started" | "drawing" | "draw-finished";

interface DrawingInterface {
  x: number;
  y: number;
  pressure?: number;
  width: number;
  height: number;
  scale: number;
  color: string;
  lineWidth: number;
  touchType?: string;
  state: DrawingState;
  handleEvent?: (source: EventSource) => void;
}

interface EventSource {
  command: string;
  x: number;
  y: number;
  lineWidth: number;
  color: string;
  state: DrawingState;
  touchType?: string;
  version?: string;
}

class Plugin implements PluginInterface {
  name: string;
  debug: boolean;
  canvas?: HTMLCanvasElement;

  constructor(initialValues?: Partial<PluginInterface>) {
    this.name = "";
    this.debug = false;

    Object.assign(this, initialValues);
  }

  draw(data: DrawingInterface) {
    const context = this.canvas?.getContext("2d");
    if (!context) return;

    context.globalCompositeOperation = "source-over";
    context.strokeStyle = data.color;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.shadowColor = "";
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.shadowBlur = 0;
    context.lineWidth = data.lineWidth;
    context.textAlign = "left";
    context.textBaseline = "top";
    context.direction = "ltr";
    context.lineDashOffset = 0;
    context.miterLimit = 0;
    context.globalAlpha = 1;
    context.fillStyle = data.color;
  }
}

export { Plugin };
export type { PluginInterface, DrawingState, DrawingInterface, EventSource };
