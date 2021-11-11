import React, { forwardRef, Ref, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { PenPlugin, Plugin } from './plugins';
import { DrawEvent, PluginMap } from './types';
import { calculateCoord, calculatePressure } from './utils';

interface AtelierProps {
  command?: string;
  color?: string;
  lineWidth?: number;
  width?: number;
  height?: number;
  enableDraw?: boolean;
  enablePressure?: boolean;
  plugins?: Plugin[];
  style?: React.CSSProperties;
  className?: string;
}

export type AtelierRef = {
  clear(): void;
};

const Atelier = (
  { command = 'pen', color = '#000000', lineWidth = 2, width = 800, height = 600, enableDraw = true, enablePressure = false, plugins = [new PenPlugin()], style, className }: AtelierProps,
  ref: Ref<AtelierRef>,
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPlugins, setCurrentPlugins] = useState<PluginMap>(
    plugins.reduce(
      (a, b) => ({
        ...a,
        [b.name]: b,
      }),
      {},
    ),
  );

  const scale = typeof window === 'undefined' ? 1 : window.devicePixelRatio;

  const canvasDefaultStyle: React.CSSProperties = useMemo(
    () => ({
      userSelect: 'none',
      WebkitUserSelect: 'none',
      touchAction: 'none',
      msTouchAction: 'none',
    }),
    [],
  );

  const canvasSizeStyle: React.CSSProperties = useMemo(
    () => ({
      width,
      height,
    }),
    [width, height],
  );

  useEffect(() => {
    if (!canvasRef.current) return;

    canvasRef.current.width = width * scale;
    canvasRef.current.height = height * scale;

    canvasRef.current.getContext('2d')?.scale(scale, scale);
  }, [scale, width, height]);

  useEffect(() => {
    if (!canvasRef.current) return;

    plugins.forEach(plugin => {
      plugin.canvas = canvasRef.current!;
    });

    setCurrentPlugins(
      Object.assign(
        {},
        ...plugins.map(plugin => {
          return {
            [plugin.name]: plugin,
          };
        }),
      ),
    );
  }, [plugins]);

  const handlers = useMemo(() => {
    let drawing = false;

    const handleDrawStart = (e: DrawEvent) => {
      e.preventDefault();
      if (!canvasRef.current) return;

      const { x, y } = calculateCoord(e, canvasRef.current);
      const pressure = enablePressure ? calculatePressure(e) : 1;
      const touchType = 'touches' in e ? (e as any).touches[0].touchType : undefined;

      currentPlugins[command].draw({
        x,
        y,
        width,
        height,
        scale,
        lineWidth,
        color,
        pressure,
        state: 'draw-started',
        touchType,
      });

      drawing = true;
    };

    const handleDrawing = (e: DrawEvent) => {
      e.preventDefault();
      if (!canvasRef.current || !drawing) return;

      const { x, y } = calculateCoord(e, canvasRef.current);
      const pressure = enablePressure ? calculatePressure(e) : 1;
      const touchType = 'touches' in e ? (e as any).touches[0].touchType : undefined;

      currentPlugins[command].draw({
        x,
        y,
        width,
        height,
        scale,
        lineWidth,
        color,
        pressure,
        state: 'drawing',
        touchType,
      });
    };

    const handleDrawFinish = (e: DrawEvent) => {
      e.preventDefault();
      if (!canvasRef.current || !drawing) return;

      const { x, y } = calculateCoord(e, canvasRef.current);
      currentPlugins[command].draw({
        x,
        y,
        width,
        height,
        scale,
        lineWidth,
        color,
        state: 'draw-finished',
      });

      drawing = false;
    };

    return enableDraw
      ? {
          onMouseDown: handleDrawStart,
          onTouchStart: handleDrawStart,
          onMouseMove: handleDrawing,
          onTouchMove: handleDrawing,
          onMouseUp: handleDrawFinish,
          onTouchEnd: handleDrawFinish,
        }
      : {};
  }, [currentPlugins, command, lineWidth, color]);

  const handleClear = useCallback(() => {
    canvasRef.current?.getContext('2d')?.clearRect(0, 0, width, height);
  }, []);

  useImperativeHandle(ref, () => ({
    clear: handleClear,
  }));

  return <canvas ref={canvasRef} {...handlers} style={{ ...canvasDefaultStyle, ...canvasSizeStyle, ...style }} className={className} />;
};

export default forwardRef(Atelier);
