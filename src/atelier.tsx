import React, { useEffect, useRef, useState } from "react";
import { EventBus } from "./event-bus";
import { PenPlugin, Plugin } from "./plugins";
import { EventSource } from "./plugins/plugin";

const VERSION = "v1";

interface AtelierProps {
  command?: string;
  color?: string;
  lineWidth?: number;
  width?: number;
  height?: number;
  enableDraw?: boolean;
  enablePressure?: boolean;
  plugins?: Plugin[];
  eventBus?: EventBus;
  onEvent?: (source: EventSource) => void;
  style?: React.CSSProperties;
  className?: string;
  debug?: boolean;
}

const calculateCoord = (
  e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement
) => {
  let x = 0;
  let y = 0;

  if ("touches" in e && e.touches && e.touches[0]) {
    x = e.touches[0].pageX;
    y = e.touches[0].pageY;
  } else if ("pageX" in e) {
    x = e.pageX;
    y = e.pageY;
  }

  const rect = canvas.getBoundingClientRect();

  return {
    x: x - rect.left - window.scrollX,
    y: y - rect.top - window.scrollY,
  };
};

const calculatePressure = (
  e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
) => {
  let pressure = 1.0;

  if ("touches" in e && e.touches && e.touches[0]) {
    if ((e as any).touches[0].touchType === "stylus") {
      pressure = (e as any).touches[0]["force"] || 0.1;
    } else {
      pressure = (e as any).touches[0]["force"] || 1;
    }
  }

  return pressure;
};

const Atelier = ({
  command = "pen",
  color = "#000000",
  lineWidth = 2,
  width = 800,
  height = 600,
  enableDraw = true,
  enablePressure = false,
  plugins = [new PenPlugin()],
  eventBus,
  onEvent,
  style,
  className,
  debug = false,
}: AtelierProps) => {
  const [currentCommand, setCurrentCommand] = useState<string>(command);
  const [currentLineWidth, setCurrentLineWidth] = useState<number>(lineWidth);
  const [currentColor, setCurrentColor] = useState<string>(color);
  const [currentPlugins, setCurrentPlugins] = useState<{
    [key: string]: Plugin;
  }>({});
  const [drawing, setDrawing] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const scale = typeof window === "undefined" ? 1 : window.devicePixelRatio;

  const canvasDefaultStyle: React.CSSProperties = {
    userSelect: "none",
    WebkitUserSelect: "none",
    touchAction: "none",
    msTouchAction: "none",
  };

  const canvasSizeStyle = {
    width,
    height,
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    canvasRef.current.width = width * scale;
    canvasRef.current.height = height * scale;

    canvasRef.current.getContext("2d")?.scale(scale, scale);

    plugins.forEach((plugin) => {
      plugin.canvas = canvasRef.current!;
    });

    setCurrentPlugins(
      Object.assign(
        {},
        ...plugins.map((plugin) => {
          return {
            [plugin.name]: plugin,
          };
        })
      )
    );
  }, [canvasRef.current]);

  useEffect(() => {
    setCurrentCommand(command);
  }, [command]);

  useEffect(() => {
    setCurrentColor(color);
  }, [color]);

  useEffect(() => {
    setCurrentLineWidth(lineWidth);
  }, [lineWidth]);

  useEffect(() => {
    if (!eventBus) return;
    eventBus.clear();

    Object.keys(currentPlugins).forEach((name) => {
      eventBus.on(name, (source) => {
        const { command, x, y, lineWidth, color, state } = source;
        currentPlugins[command].draw({
          x,
          y,
          width,
          height,
          scale,
          lineWidth,
          color,
          pressure: 1,
          state,
        });
      });
    });

    eventBus.on("clear", () => {
      canvasRef.current
        ?.getContext("2d")
        ?.clearRect(0, 0, width * scale, height * scale);
    });
  }, [eventBus, plugins]);

  // TODO: width, height 변경 처리

  const handleEvent = (source: EventSource) => {
    onEvent?.({
      ...source,
      version: VERSION,
    });
  };

  const handleDrawStart = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    if (!canvasRef.current) return;

    if (debug) console.log("mouse down");

    const { x, y } = calculateCoord(e, canvasRef.current);
    const pressure = enablePressure ? calculatePressure(e) : 1;
    const touchType =
      "touches" in e ? (e as any).touches[0].touchType : undefined;

    currentPlugins[currentCommand].draw({
      x,
      y,
      width,
      height,
      scale,
      lineWidth: currentLineWidth,
      color: currentColor,
      pressure,
      state: "draw-started",
      touchType,
      handleEvent,
    });

    setDrawing(true);
  };

  const handleDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    if (!canvasRef.current || !drawing) return;

    if (debug) console.log("mouse move");

    const { x, y } = calculateCoord(e, canvasRef.current);
    const pressure = enablePressure ? calculatePressure(e) : 1;
    const touchType =
      "touches" in e ? (e as any).touches[0].touchType : undefined;

    currentPlugins[currentCommand].draw({
      x,
      y,
      width,
      height,
      scale,
      lineWidth: currentLineWidth,
      color: currentColor,
      pressure,
      state: "drawing",
      touchType,
      handleEvent,
    });
  };

  const handleDrawFinish = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    if (!canvasRef.current || !drawing) return;

    if (debug) console.log("mouse up");

    const { x, y } = calculateCoord(e, canvasRef.current);
    currentPlugins[currentCommand].draw({
      x,
      y,
      width,
      height,
      scale,
      lineWidth: currentLineWidth,
      color: currentColor,
      state: "draw-finished",
      handleEvent,
    });

    setDrawing(false);
  };

  const handleClear = () => {
    canvasRef.current?.getContext("2d")?.clearRect(0, 0, width, height);

    handleEvent?.({
      command: "clear",
      x: 0,
      y: 0,
      lineWidth: 0,
      version: "v1",
      state: "drawing",
      color: "",
    });
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={enableDraw ? handleDrawStart : undefined}
      onMouseMove={enableDraw ? handleDrawing : undefined}
      onMouseUp={enableDraw ? handleDrawFinish : undefined}
      onTouchStart={enableDraw ? handleDrawStart : undefined}
      onTouchMove={enableDraw ? handleDrawing : undefined}
      onTouchEnd={enableDraw ? handleDrawFinish : undefined}
      style={{ ...style, ...canvasDefaultStyle, ...canvasSizeStyle }}
      className={className}
    />
  );
};

export default Atelier;
export type { EventSource };
