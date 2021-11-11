import { DrawingInterface, Plugin, PluginInterface } from './plugin';

interface Coord {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
}

interface BrushPluginInterface extends PluginInterface {
  enablePressure?: boolean;
}

class BrushPlugin extends Plugin {
  coord: Coord = { x: 0, y: 0, oldX: 0, oldY: 0 };
  midCoord: Coord = { x: 0, y: 0, oldX: 0, oldY: 0 };
  oldLineWidth: number = 0;
  enablePressure: boolean = true;

  constructor(initialValues?: BrushPluginInterface) {
    super({
      ...initialValues,
      name: 'brush',
    });

    this.enablePressure = !!initialValues?.enablePressure;
  }

  draw(data: DrawingInterface) {
    super.draw(data);

    const { x, y, pressure, lineWidth, state } = data;
    const context = this.canvas?.getContext('2d');
    if (!context) return;

    if (this.enablePressure) {
      context.lineWidth = pressure ? Math.log2(pressure + 1) * lineWidth * 0.2 + this.oldLineWidth * 0.8 : 1;
    } else {
      context.lineWidth = lineWidth * 0.02 + this.oldLineWidth * 0.98;
    }

    this.coord.x = x;
    this.coord.y = y;
    this.coord.oldX = this.coord.oldX || x;
    this.coord.oldY = this.coord.oldY || y;

    this.midCoord.x = (this.coord.oldX + this.coord.x) >> 1;
    this.midCoord.y = (this.coord.oldY + this.coord.y) >> 1;
    this.midCoord.oldX = this.midCoord.oldX || x;
    this.midCoord.oldY = this.midCoord.oldY || y;

    if (state === 'draw-started' || state === 'drawing') {
      context.beginPath();
      context.moveTo(this.midCoord.x, this.midCoord.y);
      context.quadraticCurveTo(this.coord.oldX, this.coord.oldY, this.midCoord.oldX, this.midCoord.oldY);
      context.stroke();
      context.closePath();

      this.coord.oldX = this.coord.x;
      this.coord.oldY = this.coord.y;
      this.midCoord.oldX = this.midCoord.x;
      this.midCoord.oldY = this.midCoord.y;
      this.oldLineWidth = context.lineWidth;
    } else if (state === 'draw-finished') {
      this.coord = { x: 0, y: 0, oldX: 0, oldY: 0 };
      this.midCoord = { x: 0, y: 0, oldX: 0, oldY: 0 };
      this.oldLineWidth = 0;
    }
  }
}

export default BrushPlugin;
