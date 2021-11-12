<h1 align='center'>
  Atelier 🎨
</h1>

<p align="center"><strong>Expandable drawing component for React built by <a href="https://cobalt.run">Cobalt, Inc.</a></strong></p>

<p align='center'>
  <a href="https://cobalt.run">
    <img src="https://badgen.net/badge/icon/Made%20by%20Cobalt?icon=https://caple-static.s3.ap-northeast-2.amazonaws.com/cobalt-badge.svg&label&color=5B69C3&labelColor=414C9A" />
  </a>
  <a href='https://www.npmjs.com/package/@cobaltinc/atelier'>
    <img src='https://img.shields.io/npm/v/@cobaltinc/atelier.svg' alt='Latest npm version'>
  </a>
  <a href="https://github.com/cobaltinc/atelier/blob/master/.github/CONTRIBUTING.md">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome" />
  </a>
</p>

## :rocket: Getting started

```bash
npm install @cobaltinc/atelier # or yarn add @cobaltinc/atelier
```

```jsx
import React from 'react'
import { Atelier } from '@cobaltinc/atelier'

<Atelier />
```

Demo page: [`https://cobaltinc.github.io/atelier`](https://cobaltinc.github.io/atelier)

### Props

Prop | Description | Default
---- | ----------- | -------
`command` | Set the name of registered plugin | `pen`
`color` | Set the color of the line | `#000000`
`lineWidth` | Set the width of the line | `2`
`width` | Set the width of the canvas | `800`
`height` | Set the height of the canvas | `600`
`enableDraw` | Set to `true` or `false` to enable or disable draw the canvas | `true`
`enablePressure` | Set to `true` or `false` to enable or disable pressure the canvas | `false`
`plugins` | Register the plugins to use | `[PenPlugin]`
`style` | Add inline styles to the root element
`className` | Add className to the root element

### Instance Methods
Use `ref` to call instance methods. See the [demo page](https://cobaltinc.github.io/atelier) for an example of this.
Prop | Description
---- | -----------
`clear()` | Erase everything on the canvas

## 🖋️ Default Plugins
<table>
  <tr>
    <th>PenPlugin</th><th>BrushPlugin</th><th>ErasePlugin</th>
  </tr>
  <tr>
    <td><img src="https://user-images.githubusercontent.com/3623695/141398823-7fe13e29-cbf7-4ae3-84fa-b14e88659148.gif" width='187' alt="PenPlugin gif"></td>
    <td><img src="https://user-images.githubusercontent.com/3623695/141398991-4f70f01f-59bd-494e-9f69-ce39372af698.gif" width='187' alt="BrushPlugin gif"></td>
    <td><img src="https://user-images.githubusercontent.com/3623695/141399191-aa396b83-7e05-4c5d-b075-3b8ebd701274.gif" width='187' alt="ErasePlugin gif"></td>
  </tr>
  <tr>
    <th>HighlighterPlugin</th><th>LaserPlugin</th>
  </tr>
  <tr>
    <td><img src="https://user-images.githubusercontent.com/3623695/141399532-d29a3454-d5c0-45f3-a4df-6f8794f382bd.gif" width='187' alt="HighlighterPlugin gif"></td>
    <td><img src="https://user-images.githubusercontent.com/3623695/141399656-677cb722-8556-477d-8106-635d548c350c.gif" width='187' alt="LaserPlugin gif"></td>
  </tr>
</table>

```jsx
import React from 'react'
import {
  Atelier,
  PenPlugin,
  BrushPlugin,
  ErasePlugin,
  HighlighterPlugin,
  LaserPlugin
} from '@cobaltinc/atelier'

<Atelier plugins={[PenPlugin, BrushPlugin, ErasePlugin, HighlighterPlugin, LaserPlugin]} />
```

## 🖌️ Custom Plugin

If you want new plugin, you can make easily.

```tsx
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
        lastX: x,
        lastY: y,
      });
    }
  }
}

<Atelier command="dash" plugins={[DashPlugin]} />
```

And the result:

<img src="https://user-images.githubusercontent.com/3623695/141399812-9f8e3645-ad40-4d16-887e-0de485c7a720.gif" width="500" alt="DashPlugin gif">

## :page_facing_up: License

Atelier is made available under the [MIT License](./LICENSE).
