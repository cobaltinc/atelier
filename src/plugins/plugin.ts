interface PluginInterface {
  name: string;
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
}

export class Plugin implements PluginInterface {
  name: string;
  canvas?: HTMLCanvasElement;

  constructor(initialValues?: PluginInterface) {
    this.name = '';
    Object.assign(this, initialValues);
  }

  draw(data: DrawingInterface) {
    const context = this.canvas?.getContext("2d");
    if (!context) return;

    Object.assign(context, {
      globalCompositeOperation: "source-over",
      strokeStyle: data.color,
      lineCap: "round",
      lineJoin: "round",
      shadowColor: "",
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowBlur: 0,
      lineWidth: data.lineWidth,
      textAlign: "left",
      textBaseline: "top",
      direction: "ltr",
      lineDashOffset: 0,
      miterLimit: 0,
      globalAlpha: 1,
      fillStyle: data.color,
    })
  }
}

export type { PluginInterface, DrawingState, DrawingInterface };