import { DrawEvent } from './types';

export const calculateCoord = (e: DrawEvent, canvas: HTMLCanvasElement) => {
  let x = 0;
  let y = 0;

  if ('touches' in e && e.touches && e.touches[0]) {
    x = e.touches[0].pageX;
    y = e.touches[0].pageY;
  } else if ('pageX' in e) {
    x = e.pageX;
    y = e.pageY;
  }

  const rect = canvas.getBoundingClientRect();

  return {
    x: x - rect.left - window.scrollX,
    y: y - rect.top - window.scrollY,
  };
};

export const calculatePressure = (e: DrawEvent) => {
  let pressure = 1.0;

  if ('touches' in e && e.touches && e.touches[0]) {
    if ((e as any).touches[0].touchType === 'stylus') {
      pressure = (e as any).touches[0]['force'] || 0.1;
    } else {
      pressure = (e as any).touches[0]['force'] || 1;
    }
  }

  return pressure;
};
