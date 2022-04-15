import React, { forwardRef, Ref, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { DrawingInterface, DrawingState, PenPlugin, Plugin } from './plugins';
import { DrawEvent } from './types';
import { calculateCoord, calculatePressure } from './utils';

type ChangeEventType = 'draw' | 'clear';
export type AtelierChangeEvent = {
  type: ChangeEventType;
  data?: DrawingInterface;
};

interface AtelierProps {
  /**
   * Drawing command
   */
  command?: string;

  /**
   * Color of the line when drawing.
   */
  color?: string;

  /**
   * Thickness of the line when drawing.
   */
  lineWidth?: number;

  /**
   * Canvas width
   */
  width?: number;

  /**
   * Canvas height
   */
  height?: number;

  /**
   * If you set enableDraw to false, you cannot draw.
   */
  enableDraw?: boolean;

  /**
   * If you set enablePressure to true, pen pressure is applied.
   */
  enablePressure?: boolean;

  /**
   * Register the plugin to be used.
   */
  plugins?: typeof Plugin[];

  /**
   * Fired when an alteration to canvas is commited.
   */
  onChange?(e: AtelierChangeEvent): void;

  style?: React.CSSProperties;

  className?: string;
}

export type AtelierRef = {
  draw(e: AtelierChangeEvent): void;
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
      onChange,
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

        const drawingData = {
          command,
          x,
          y,
          width,
          height,
          scale,
          lineWidth,
          color,
          pressure,
          state: 'draw-started' as DrawingState,
          touchType,
        };
        currentPlugins[command].draw(drawingData);
        onChange?.({ type: 'draw', data: drawingData });

        drawing = true;
      };

      const handleDrawing = (e: DrawEvent) => {
        e.preventDefault();
        if (!canvasRef.current || !drawing) return;

        const { x, y } = calculateCoord(e, canvasRef.current);
        const pressure = enablePressure ? calculatePressure(e) : 1;
        const touchType = 'touches' in e ? (e as any).touches[0].touchType : undefined;

        const drawingData = {
          command,
          x,
          y,
          width,
          height,
          scale,
          lineWidth,
          color,
          pressure,
          state: 'drawing' as DrawingState,
          touchType,
        };
        currentPlugins[command].draw(drawingData);
        onChange?.({ type: 'draw', data: drawingData });
      };

      const handleDrawFinish = (e: DrawEvent) => {
        e.preventDefault();
        if (!canvasRef.current || !drawing) return;

        const { x, y } = calculateCoord(e, canvasRef.current);
        const drawingData = {
          command,
          x,
          y,
          width,
          height,
          scale,
          lineWidth,
          color,
          state: 'draw-finished' as DrawingState,
        };
        currentPlugins[command].draw(drawingData);
        onChange?.({ type: 'draw', data: drawingData });

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
    }, [currentPlugins, command, lineWidth, color, width, height, scale, enableDraw]);

    const handleCommit = useCallback(
      (e: AtelierChangeEvent) => {
        if (e.type === 'draw') {
          const data = e.data!;
          currentPlugins[data.command].draw(data);
        } else if (e.type === 'clear') {
          canvasRef.current?.getContext('2d')?.clearRect(0, 0, width, height);
        }
      },
      [currentPlugins],
    );

    const handleClear = useCallback(() => {
      canvasRef.current?.getContext('2d')?.clearRect(0, 0, width, height);
      onChange?.({ type: 'clear' });
    }, [width, height]);

    useImperativeHandle(ref, () => ({
      draw: handleCommit,
      clear: handleClear,
    }));

    return <canvas ref={canvasRef} {...handlers} style={{ ...style, ...canvasDefaultStyle, ...canvasSizeStyle }} className={className} />;
  },
);
