import { DrawingInterface, Plugin, PluginInterface } from './plugin';

export class EraserPlugin extends Plugin {
  name: string = 'eraser';
  prevX?: number;
  prevY?: number;

  draw(data: DrawingInterface) {
    super.draw(data);

    const { x, y, state } = data;
    const context = this.canvas?.getContext('2d');
    if (!context) return;

    context.globalCompositeOperation = 'destination-out';

    const prevX = this.prevX || x;
    const prevY = this.prevY || y;

    if (state === 'draw-started' || state === 'drawing') {
      context.beginPath();
      context.moveTo(prevX, prevY);
      context.lineTo(x, y);
      context.stroke();

      this.prevX = x;
      this.prevY = y;
    }
  }
}
