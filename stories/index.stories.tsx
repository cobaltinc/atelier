import React, { useRef, useState } from 'react';
import { Atelier, AtelierRef, BrushPlugin, EraserPlugin, HighlighterPlugin, LaserPlugin, PenPlugin } from '../dist';

export default {
  component: Atelier,
  title: 'Atelier',
};

const Wrapper = ({ children }) => {
  return <div style={{ padding: 30 }}>{children}</div>;
};

export const Default = () => {
  const ref = useRef<AtelierRef>();
  const [command, setCommand] = useState<string>('pen');
  const [lineWidth, setLineWidth] = useState<number>(4);
  const [color, setColor] = useState<string>('#000000');

  return (
    <Wrapper>
      <button onClick={() => setCommand('laser')}>Laser</button>
      <button onClick={() => setCommand('pen')}>Pen</button>
      <button onClick={() => setCommand('brush')}>Brush</button>
      <button onClick={() => setCommand('eraser')}>Eraser</button>
      <button onClick={() => setCommand('highlighter')}>Highlighter</button>
      <button onClick={() => ref.current.clear()}>Clear</button>
      <input type="color" onChange={e => setColor(e.currentTarget.value)} />
      <input type="range" onChange={e => setLineWidth(parseInt(e.currentTarget.value))} defaultValue="4" min="1" max="40" step="1" />

      <br />

      <Atelier
        ref={ref}
        command={command}
        lineWidth={lineWidth}
        color={color}
        plugins={[new PenPlugin(), new EraserPlugin(), new LaserPlugin(), new HighlighterPlugin(), new BrushPlugin()]}
        enablePressure
        enableDraw
        style={{ border: '1px solid black' }}
      />
    </Wrapper>
  );
};
