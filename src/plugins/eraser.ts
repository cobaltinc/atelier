import { DrawingInterface, Plugin, PluginInterface } from './plugin';

class EraserPlugin extends Plugin {
  prevX?: number;
  prevY?: number;

  constructor(initialValues?: PluginInterface) {
    super({
      ...initialValues,
      name: 'eraser',
    });
  }

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

export default EraserPlugin;
