import { DrawingInterface, Plugin } from './plugin';

interface Coord {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
}

export class PenPlugin extends Plugin {
  name: string = 'pen';
  coord: Coord = { x: 0, y: 0, oldX: 0, oldY: 0 };
  midCoord: Coord = { x: 0, y: 0, oldX: 0, oldY: 0 };

  draw(data: DrawingInterface) {
    super.draw(data);

    const { x, y, state } = data;
    const context = this.canvas?.getContext('2d');
    if (!context) return;

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
    } else if (state === 'draw-finished') {
      this.coord = { x: 0, y: 0, oldX: 0, oldY: 0 };
      this.midCoord = { x: 0, y: 0, oldX: 0, oldY: 0 };
    }
  }
}
