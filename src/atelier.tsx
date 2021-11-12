import React, { forwardRef, Ref, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { PenPlugin, Plugin } from './plugins';
import { DrawEvent } from './types';
import { calculateCoord, calculatePressure } from './utils';

interface AtelierProps {
  command?: string;
  color?: string;
  lineWidth?: number;
  width?: number;
  height?: number;
  enableDraw?: boolean;
  enablePressure?: boolean;
  plugins?: typeof Plugin[];
  style?: React.CSSProperties;
  className?: string;
}

export type AtelierRef = {
  clear(): void;
};

type PluginMap = { [key: string]: Plugin };

export const Atelier = forwardRef(
  (
    {
      command = 'pen',
      color = '#000000',
      lineWidth = 2,
      width = 800,
      height = 600,
      enableDraw = true,
      enablePressure = false,
      plugins = [PenPlugin],
      style,
      className,
    }: AtelierProps,
    ref: Ref<AtelierRef>,
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [currentPlugins, setCurrentPlugins] = useState<PluginMap>(
      Object.assign(
        {},
        ...plugins.map((pluginClass) => {
          const plugin = new pluginClass({ canvas: canvasRef.current! });
          return {
            [plugin.name!]: plugin,
          };
        }),
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

      setCurrentPlugins(
        Object.assign(
          {},
          ...plugins.map((pluginClass) => {
            const plugin = new pluginClass({ canvas: canvasRef.current! });
            return {
              [plugin.name!]: plugin,
            };
          }),
        ),
      );
    }, [JSON.stringify(plugins)]);

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
            onMouseOut: handleDrawFinish,
          }
        : {};
    }, [currentPlugins, command, lineWidth, color, width, height, scale]);

    const handleClear = useCallback(() => {
      canvasRef.current?.getContext('2d')?.clearRect(0, 0, width, height);
    }, [width, height]);

    useImperativeHandle(ref, () => ({
      clear: handleClear,
    }));

    return <canvas ref={canvasRef} {...handlers} style={{ ...style, ...canvasDefaultStyle, ...canvasSizeStyle }} className={className} />;
  },
);
