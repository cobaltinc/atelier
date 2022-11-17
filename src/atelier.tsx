import React, { forwardRef, Ref, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { DrawingInterface, DrawingState, PenPlugin, Plugin } from './plugins';
import { DrawEvent } from './types';
import { calculateCoord, calculatePressure } from './utils';

type ChangeEventType = 'draw' | 'clear' | 'redo' | 'undo';
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
   * DOM width
   */
  width?: number;

  /**
   * DOM height
   */
  height?: number;

  /**
   * Canvas width
   */
  canvasWidth?: number;

  /**
   * Canvas height
   */
  canvasHeight?: number;

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

interface Options {
  commit?: boolean;
  fireOnChange?: boolean;
}

export type AtelierRef = {
  clearHistories(): void;
  draw(e: DrawingInterface, options?: Options): void;
  clear(options?: Options): void;
  redo(options?: Options): void;
  undo(options?: Options): void;
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
      canvasWidth: _canvasWidth,
      canvasHeight: _canvasHeight,
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
    const histories = useRef<AtelierChangeEvent[][]>([]);
    const undoList = useRef<AtelierChangeEvent[][]>([]);
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
    const canvasWidth = _canvasWidth || width;
    const canvasHeight = _canvasHeight || height;

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

      canvasRef.current.width = (canvasWidth || width) * scale;
      canvasRef.current.height = (canvasHeight || height) * scale;

      canvasRef.current.getContext('2d')?.scale(scale, scale);
    }, [scale, canvasWidth, canvasHeight, width, height]);

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

    const handleCommit = useCallback(
      (e: AtelierChangeEvent) => {
        undoList.current = [];
        if (e.type === 'draw') {
          const data = e.data;

          if (data?.state === 'draw-started') {
            histories.current.push([e]);
          } else {
            const length = histories.current.length;
            histories.current[length - 1].push(e);
          }
        } else if (e) {
          histories.current.push([e]);
        }
      },
      [histories],
    );

    const handleDraw = useCallback(
      (data: DrawingInterface, options: Options = { commit: true, fireOnChange: true }) => {
        const drawingData = {
          ...data,
          x: (data.x / data.width) * canvasWidth,
          y: (data.y / data.height) * canvasHeight,
          width,
          height,
          lineWidth: (data.lineWidth / data.width) * width,
        };
        currentPlugins[data.command].draw(drawingData);
        options?.fireOnChange && onChange?.({ type: 'draw', data: drawingData });
        options?.commit && handleCommit({ type: 'draw', data: drawingData });
      },
      [currentPlugins, canvasWidth, canvasHeight, width, height],
    );

    const handleClear = useCallback(
      (options: Options = { commit: true, fireOnChange: true }) => {
        canvasRef.current?.getContext('2d')?.clearRect(0, 0, canvasWidth, canvasHeight);
        options?.fireOnChange && onChange?.({ type: 'clear' });
        options?.commit && handleCommit({ type: 'clear' });
      },
      [canvasWidth, canvasHeight],
    );

    const handleRedo = useCallback(
      (options: Options = { fireOnChange: true }) => {
        if (undoList.current.length === 0) return;
        histories.current.push(undoList.current.pop()!);

        handleClear({ commit: false, fireOnChange: false });
        histories.current
          .reduce((prev, curr) => [...prev, ...curr], [])
          .forEach((event) => {
            if (event.type === 'draw') handleDraw(event.data!, { commit: false, fireOnChange: false });
            else if (event.type === 'clear') handleClear({ commit: false, fireOnChange: false });
          });

        options?.fireOnChange && onChange?.({ type: 'redo' });
      },
      [handleDraw, handleClear, onChange],
    );

    const handleUndo = useCallback(
      (options: Options = { fireOnChange: true }) => {
        if (histories.current.length === 0) return;
        undoList.current.push(histories.current.pop()!);

        handleClear({ commit: false, fireOnChange: false });
        histories.current
          .reduce((prev, curr) => [...prev, ...curr], [])
          .forEach((event) => {
            if (event.type === 'draw') handleDraw(event.data!, { commit: false, fireOnChange: false });
            else if (event.type === 'clear') handleClear({ commit: false, fireOnChange: false });
          });

        options?.fireOnChange && onChange?.({ type: 'undo' });
      },
      [handleDraw, handleClear, onChange],
    );

    useImperativeHandle(ref, () => ({
      clearHistories: () => {
        histories.current = [];
      },
      draw: handleDraw,
      clear: handleClear,
      redo: handleRedo,
      undo: handleUndo,
    }));

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
          x: (x * canvasWidth) / width,
          y: (y * canvasHeight) / height,
          width: canvasWidth,
          height: canvasHeight,
          lineWidth: (lineWidth * width) / canvasWidth,
          scale,
          color,
          pressure,
          state: 'draw-started' as DrawingState,
          touchType,
        };
        handleDraw(drawingData);

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
          x: (x * canvasWidth) / width,
          y: (y * canvasHeight) / height,
          width: canvasWidth,
          height: canvasHeight,
          lineWidth: (lineWidth * width) / canvasWidth,
          scale,
          color,
          pressure,
          state: 'drawing' as DrawingState,
          touchType,
        };
        handleDraw(drawingData);
      };

      const handleDrawFinish = (e: DrawEvent) => {
        e.preventDefault();
        if (!canvasRef.current || !drawing) return;

        const { x, y } = calculateCoord(e, canvasRef.current);
        const drawingData = {
          command,
          x: (x * canvasWidth) / width,
          y: (y * canvasHeight) / height,
          width: canvasWidth,
          height: canvasHeight,
          lineWidth: (lineWidth * width) / canvasWidth,
          scale,
          color,
          state: 'draw-finished' as DrawingState,
        };
        handleDraw(drawingData);

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
    }, [currentPlugins, handleDraw, command, lineWidth, color, width, height, scale, enableDraw]);

    return <canvas ref={canvasRef} {...handlers} style={{ ...canvasDefaultStyle, ...canvasSizeStyle, ...style }} className={className} />;
  },
);
