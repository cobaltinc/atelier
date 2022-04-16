import React, { useCallback, useRef, useState } from 'react';
import {
  Atelier,
  AtelierRef,
  BrushPlugin,
  EraserPlugin,
  HighlighterPlugin,
  LaserPlugin,
  PenPlugin,
  Plugin,
  DrawingInterface,
  AtelierChangeEvent,
} from '../src';

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
      <button onClick={() => ref.current.undo()}>Undo</button>
      <button onClick={() => ref.current.redo()}>Redo</button>
      <input type="color" onChange={(e) => setColor(e.currentTarget.value)} />
      <input type="range" onChange={(e) => setLineWidth(parseInt(e.currentTarget.value))} defaultValue="4" min="1" max="40" step="1" />

      <br />

      <Atelier
        ref={ref}
        width={1280}
        height={720}
        command={command}
        lineWidth={lineWidth}
        color={color}
        plugins={[PenPlugin, EraserPlugin, LaserPlugin, HighlighterPlugin, BrushPlugin]}
        enablePressure
        enableDraw
        style={{ border: '1px solid black' }}
      />
    </Wrapper>
  );
};

class DashPlugin extends Plugin {
  name: string = 'dash';
  prevX: number;
  prevY: number;

  draw(data: DrawingInterface) {
    super.draw(data);

    const { x, y, state } = data;
    const context = this.canvas?.getContext('2d');
    context.setLineDash([5, 30]);

    const prevX = this.prevX || x;
    const prevY = this.prevY || y;

    if (state === 'draw-started' || state === 'drawing') {
      context.beginPath();
      context.moveTo(prevX, prevY);
      context.lineTo(x, y);
      context.stroke();
      context.closePath();

      Object.assign(this, {
        prevX: x,
        prevY: y,
      });
    }
  }
}

export const CustomPlugin = () => {
  const ref = useRef<AtelierRef>();
  const [command, setCommand] = useState<string>('pen');
  const [lineWidth, setLineWidth] = useState<number>(4);
  const [color, setColor] = useState<string>('#000000');

  return (
    <Wrapper>
      <button onClick={() => setCommand('pen')}>Pen</button>
      <button onClick={() => setCommand('dash')}>Dash</button>
      <button onClick={() => ref.current.clear()}>Clear</button>
      <input type="color" onChange={(e) => setColor(e.currentTarget.value)} />
      <input type="range" onChange={(e) => setLineWidth(parseInt(e.currentTarget.value))} defaultValue="4" min="1" max="40" step="1" />

      <br />

      <Atelier
        ref={ref}
        width={1280}
        height={720}
        command={command}
        lineWidth={lineWidth}
        color={color}
        plugins={[PenPlugin, DashPlugin]}
        enablePressure
        enableDraw
        style={{ border: '1px solid black' }}
      />
    </Wrapper>
  );
};

interface ChangeHistory {
  timestamp: number;
  event: AtelierChangeEvent;
}

interface Recording {
  date: Date;
  histories: ChangeHistory[];
}

export const Recording = () => {
  const ref = useRef<AtelierRef>();
  const [width, setWidth] = useState(1280);
  const [height, setHeight] = useState(720);
  const [command, setCommand] = useState<string>('pen');
  const [lineWidth, setLineWidth] = useState<number>(4);
  const [color, setColor] = useState<string>('#000000');
  const [recording, setRecording] = useState(false);
  const [recordingList, setRecordingList] = useState<Recording[]>([]);

  const eventHistories = useRef<ChangeHistory[]>([]);
  const intervalId = useRef<ReturnType<typeof setInterval>>();

  const handleRecordingStart = useCallback(() => {
    ref.current.clear({ commit: false, fireOnChange: false });
    eventHistories.current = [];
    setRecording(true);
  }, []);

  const handleRecordingStop = useCallback(() => {
    setRecordingList([...recordingList, { date: new Date(), histories: eventHistories.current }]);
    eventHistories.current = [];
    setRecording(false);
    ref.current.clear({ commit: false, fireOnChange: false });
  }, [recordingList]);

  const handleReplay = useCallback((recording: Recording) => {
    clearInterval(intervalId.current);
    setRecording(false);
    ref.current.clear({ commit: false, fireOnChange: false });
    ref.current.clearHistories();

    const histories = [...recording.histories];
    const begin = Date.now();
    const startTimestamp = histories[0].timestamp;
    intervalId.current = setInterval(() => {
      if (histories.length === 0) {
        clearInterval(intervalId.current);
        return;
      }

      while (histories.length) {
        const history = histories[0];
        if (Date.now() - begin >= history.timestamp - startTimestamp) {
          const event = histories.shift().event;

          if (event.type !== 'draw') console.log(event);

          if (event.type === 'draw') ref.current.draw(event.data);
          else if (event.type === 'clear') ref.current.clear();
          else if (event.type === 'redo') ref.current.redo();
          else if (event.type === 'undo') ref.current.undo();
        } else {
          break;
        }
      }
    }, 10);
  }, []);

  return (
    <Wrapper>
      <div>
        Width:
        <input type="number" value={width} onChange={(e) => setWidth(parseInt(e.target.value))} />
        Height:
        <input type="number" value={height} onChange={(e) => setHeight(parseInt(e.target.value))} />
      </div>

      <div>
        <button onClick={() => setCommand('laser')}>Laser</button>
        <button onClick={() => setCommand('pen')}>Pen</button>
        <button onClick={() => setCommand('brush')}>Brush</button>
        <button onClick={() => setCommand('eraser')}>Eraser</button>
        <button onClick={() => setCommand('highlighter')}>Highlighter</button>
        <button onClick={() => ref.current.clear()}>Clear</button>
        <button onClick={() => ref.current.undo()}>Undo</button>
        <button onClick={() => ref.current.redo()}>Redo</button>
        <input type="color" onChange={(e) => setColor(e.currentTarget.value)} />
        <input type="range" onChange={(e) => setLineWidth(parseInt(e.currentTarget.value))} defaultValue="4" min="1" max="40" step="1" />
      </div>

      <div>
        <button disabled={recording} onClick={handleRecordingStart}>
          Start recording
        </button>
        <button disabled={!recording} onClick={handleRecordingStop}>
          Stop recording
        </button>
      </div>

      <br />

      <Atelier
        ref={ref}
        width={width}
        height={height}
        command={command}
        lineWidth={lineWidth}
        color={color}
        plugins={[PenPlugin, EraserPlugin, LaserPlugin, HighlighterPlugin, BrushPlugin]}
        enablePressure
        enableDraw={recording}
        onChange={(e) => eventHistories.current.push({ timestamp: Date.now(), event: e })}
        style={{ border: '1px solid black' }}
      />

      <div>
        <h3>Recording list</h3>
        <ul>
          {recordingList.map((item) => (
            <div key={item.date.toISOString()}>
              {item.date.toISOString()}
              <button onClick={() => handleReplay(item)}>Replay</button>
            </div>
          ))}
        </ul>
      </div>
    </Wrapper>
  );
};
