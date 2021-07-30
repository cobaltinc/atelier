import React, { useState } from 'react';
import { Atelier, BrushPlugin, EraserPlugin, HighlighterPlugin, LaserPlugin, PenPlugin } from '../src';

export default {
  component: Atelier,
  title: 'Atelier',
};

const Wrapper = ({ children }) => {
  return <div style={{ padding: 30 }}>{children}</div>;
};

export const Default = () => {
  const [currentCommand, setCurrentCommand] = useState<string>('pen');
  const [currentLineWidth, setCurrentLineWidth] = useState<number>(4);
  const [currentColor, setCurrentColor] = useState<string>('#000000');

  const atelierStyle: React.CSSProperties = {
    border: '1px solid black',
  };

  return (
    <Wrapper>
      <button id="laser" onClick={() => setCurrentCommand('laser')}>
        Laser
      </button>
      <button id="pen" onClick={() => setCurrentCommand('pen')}>
        Pen
      </button>
      <button id="brush" onClick={() => setCurrentCommand('brush')}>
        Brush
      </button>
      <button id="eraser" onClick={() => setCurrentCommand('eraser')}>
        Eraser
      </button>
      <button id="highlighter" onClick={() => setCurrentCommand('highlighter')}>
        Highlighter
      </button>
      {/* <button id="clear" onClick={() => handleClear()}>
        Clear
      </button> */}
      <input type="color" onChange={e => setCurrentColor(e.currentTarget.value)} />
      <input type="range" onChange={e => setCurrentLineWidth(parseInt(e.currentTarget.value))} defaultValue="4" min="1" max="40" step="1" />

      <br />

      <Atelier
        command={currentCommand}
        lineWidth={currentLineWidth}
        color={currentColor}
        width={800}
        height={600}
        plugins={[new PenPlugin(), new EraserPlugin(), new LaserPlugin(), new HighlighterPlugin(), new BrushPlugin()]}
        enablePressure
        enableDraw
        style={atelierStyle}
      />
    </Wrapper>
  );
};
